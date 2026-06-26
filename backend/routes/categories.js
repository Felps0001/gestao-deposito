import { Router } from 'express';
import Category from '../models/Category.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function serialize(c) {
  return {
    id: c._id.toString(),
    nome: c.nome,
    descricao: c.descricao,
    dataCadastro: c.createdAt,
  };
}

// Listar categorias
router.get('/', authRequired, async (req, res, next) => {
  try {
    const cats = await Category.find().sort({ nome: 1 });
    res.json(cats.map(serialize));
  } catch (err) {
    next(err);
  }
});

// Criar categoria
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { nome, descricao } = req.body || {};
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'O nome e obrigatorio' });
    }

    const existing = await Category.findOne({ nome: nome.trim() });
    if (existing) {
      return res.status(409).json({ error: 'Categoria ja existe' });
    }

    const cat = await Category.create({ nome: nome.trim(), descricao: descricao || null });
    res.status(201).json(serialize(cat));
  } catch (err) {
    next(err);
  }
});

// Excluir categoria
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Categoria nao encontrada' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
