import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import Item from '../models/Item.js';
import StockMovement from '../models/StockMovement.js';
import ItemHistory from '../models/ItemHistory.js';
import { authRequired } from '../middleware/auth.js';
import { r2, r2Enabled, R2_BUCKET, R2_PREFIX, R2_PUBLIC_URL } from '../r2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem sao permitidos'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Faz upload da imagem. No R2 retorna a URL publica; em dev (disco) retorna o nome do arquivo.
async function uploadImage(file) {
  const ext = path.extname(file.originalname);
  const name = `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  if (r2Enabled) {
    const key = R2_PREFIX ? `${R2_PREFIX}/${name}` : name;
    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );
    } catch (err) {
      console.error('Falha no upload para o R2:', err);
      throw new Error(
        `Erro ao enviar a imagem para o R2 (${err.name || 'erro'}: ${err.message}). ` +
          'Verifique as credenciais/permissoes do bucket.'
      );
    }
    return `${R2_PUBLIC_URL}/${key}`;
  }

  fs.writeFileSync(path.join(uploadsDir, name), file.buffer);
  return name;
}

// Remove a imagem do storage (R2 ou disco), ignorando erros de objeto inexistente.
async function deleteImage(foto) {
  if (!foto) return;
  try {
    if (/^https?:\/\//i.test(foto)) {
      if (!r2Enabled) return;
      const key = foto.replace(`${R2_PUBLIC_URL}/`, '');
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    } else {
      const p = path.join(uploadsDir, foto);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  } catch (err) {
    console.error('Falha ao remover imagem:', err.message);
  }
}

const router = Router();

// Rotulos amigaveis dos campos para o historico
const CAMPO_LABEL = {
  nome: 'Nome',
  foto: 'Foto',
  categoria: 'Categoria',
  tipoUso: 'Tipo de uso',
  observacoes: 'Observacoes',
};

function valorTexto(v) {
  if (v == null || v === '') return null;
  return String(v);
}

function serialize(item) {
  if (!item) return item;
  const foto = item.foto
    ? /^https?:\/\//i.test(item.foto)
      ? item.foto
      : `/uploads/${item.foto}`
    : null;
  return {
    id: item._id.toString(),
    nome: item.nome,
    qtde: item.qtde,
    foto,
    categoria: item.categoria,
    tipoUso: item.tipoUso,
    observacoes: item.observacoes,
    dataCadastro: item.createdAt,
    dataAlteracao: item.updatedAt,
  };
}

// Listar itens (catalogo) - com busca opcional por nome/categoria
router.get('/', authRequired, async (req, res, next) => {
  try {
    const { q, categoria } = req.query;
    const filter = {};

    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [{ nome: rx }, { observacoes: rx }];
    }
    if (categoria) {
      filter.categoria = categoria;
    }

    const items = await Item.find(filter).sort({ updatedAt: -1 });
    res.json(items.map(serialize));
  } catch (err) {
    next(err);
  }
});

// Buscar um item
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item nao encontrado' });
    res.json(serialize(item));
  } catch (err) {
    next(err);
  }
});

// Cadastrar item
router.post('/', authRequired, upload.single('foto'), async (req, res, next) => {
  try {
    const { nome, qtde, categoria, tipoUso, observacoes } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'O nome e obrigatorio' });
    }

    const foto = req.file ? await uploadImage(req.file) : null;
    const item = await Item.create({
      nome: nome.trim(),
      qtde: Number(qtde) || 0,
      foto,
      categoria: categoria || null,
      tipoUso: tipoUso || null,
      observacoes: observacoes || null,
    });

    await ItemHistory.create({
      item: item._id,
      acao: 'criado',
      alteracoes: [],
      usuario: req.user?.username || null,
    });

    res.status(201).json(serialize(item));
  } catch (err) {
    next(err);
  }
});

// Atualizar item
router.put('/:id', authRequired, upload.single('foto'), async (req, res, next) => {
  try {
    const existing = await Item.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Item nao encontrado' });

    const { nome, categoria, tipoUso, observacoes } = req.body;

    // Guarda os valores anteriores para montar o historico de alteracoes
    // (a quantidade nao e editada aqui; ela so muda via /movimentacao)
    const antes = {
      nome: existing.nome,
      foto: existing.foto,
      categoria: existing.categoria,
      tipoUso: existing.tipoUso,
      observacoes: existing.observacoes,
    };

    if (req.file) {
      // remove a foto antiga e sobe a nova
      await deleteImage(existing.foto);
      existing.foto = await uploadImage(req.file);
    }

    if (nome != null) existing.nome = nome.trim();
    if (categoria != null) existing.categoria = categoria;
    if (tipoUso != null) existing.tipoUso = tipoUso;
    if (observacoes != null) existing.observacoes = observacoes;

    // Monta a lista de campos que realmente mudaram
    const alteracoes = [];
    for (const campo of Object.keys(CAMPO_LABEL)) {
      const de = valorTexto(antes[campo]);
      const para = valorTexto(existing[campo]);
      if (de !== para) {
        alteracoes.push({ campo: CAMPO_LABEL[campo], de, para });
      }
    }

    await existing.save();

    if (alteracoes.length) {
      await ItemHistory.create({
        item: existing._id,
        acao: 'atualizado',
        alteracoes,
        usuario: req.user?.username || null,
      });
    }

    res.json(serialize(existing));
  } catch (err) {
    next(err);
  }
});

// Historico de alteracoes de um item
router.get('/:id/historico', authRequired, async (req, res, next) => {
  try {
    const historico = await ItemHistory.find({ item: req.params.id }).sort({ createdAt: -1 });
    res.json(
      historico.map((h) => ({
        id: h._id.toString(),
        acao: h.acao,
        alteracoes: h.alteracoes,
        usuario: h.usuario,
        data: h.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Registrar movimentacao de estoque (entrada/saida) e atualizar a quantidade
router.post('/:id/movimentacao', authRequired, async (req, res, next) => {
  try {
    const { tipo, quantidade, observacao } = req.body || {};
    const qtd = Number(quantidade);

    if (!['entrada', 'saida'].includes(tipo)) {
      return res.status(400).json({ error: 'tipo deve ser "entrada" ou "saida"' });
    }
    if (!Number.isFinite(qtd) || qtd < 1) {
      return res.status(400).json({ error: 'quantidade deve ser um numero maior que zero' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item nao encontrado' });

    const novoSaldo = tipo === 'entrada' ? item.qtde + qtd : item.qtde - qtd;
    if (novoSaldo < 0) {
      return res.status(400).json({ error: 'Estoque insuficiente para a saida' });
    }

    item.qtde = novoSaldo;
    await item.save();

    await StockMovement.create({
      item: item._id,
      tipo,
      quantidade: qtd,
      saldoApos: novoSaldo,
      usuario: req.user?.username || null,
      observacao: observacao || null,
    });

    res.status(201).json(serialize(item));
  } catch (err) {
    next(err);
  }
});

// Listar movimentacoes de um item
router.get('/:id/movimentacoes', authRequired, async (req, res, next) => {
  try {
    const movs = await StockMovement.find({ item: req.params.id }).sort({ createdAt: -1 });
    res.json(
      movs.map((m) => ({
        id: m._id.toString(),
        tipo: m.tipo,
        quantidade: m.quantidade,
        saldoApos: m.saldoApos,
        usuario: m.usuario,
        observacao: m.observacao,
        data: m.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Excluir item
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const existing = await Item.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Item nao encontrado' });

    await deleteImage(existing.foto);

    await StockMovement.deleteMany({ item: existing._id });
    await ItemHistory.deleteMany({ item: existing._id });
    await existing.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
