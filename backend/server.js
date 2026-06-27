import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { connectDB } from './db.js';
import { CORS_ORIGINS } from './config.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import categoryRoutes from './routes/categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Headers de seguranca. crossOriginResourcePolicy liberado para permitir
// que o frontend (outra origem) carregue as imagens servidas em /uploads.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS: se CORS_ORIGIN estiver definido, restringe as origens permitidas;
// caso contrario (dev), libera para qualquer origem.
app.use(
  cors({
    origin: CORS_ORIGINS.length ? CORS_ORIGINS : true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Servir as fotos enviadas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/categories', categoryRoutes);

// Tratamento de erros central
app.use((err, req, res, next) => {
  // ID invalido (ex.: /items/abc) -> 404 em vez de erro tecnico
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'Registro nao encontrado' });
  }
  // Violacao de indice unico (ex.: username/categoria duplicada)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Registro duplicado' });
  }
  // Erros de validacao do Mongoose ou de upload (multer/imagem)
  if (err.name === 'ValidationError' || err.name === 'MulterError' || err.status === 400) {
    return res.status(400).json({ error: err.message || 'Dados invalidos' });
  }
  // Demais erros: 500
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });

    // Encerramento gracioso (util no Render): fecha o servidor e a conexao do Mongo.
    const shutdown = async (signal) => {
      console.log(`\n${signal} recebido. Encerrando...`);
      server.close(async () => {
        const mongoose = (await import('./db.js')).default;
        await mongoose.connection.close();
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('Falha ao conectar no MongoDB:', err.message);
    process.exit(1);
  });
