import bcrypt from 'bcryptjs';
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import Category from './models/Category.js';

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';

const categoriasPadrao = ['Ferramentas', 'Limpeza', 'Escritorio', 'Eletronicos', 'Outros'];

async function run() {
  await connectDB();

  // Usuario admin
  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`Usuario "${username}" ja existe. Nada a fazer.`);
  } else {
    const passwordHash = bcrypt.hashSync(password, 10);
    await User.create({ username, passwordHash, role: 'admin' });
    console.log(`Usuario admin criado: ${username} / ${password}`);
  }

  // Categorias padrao
  for (const nome of categoriasPadrao) {
    const found = await Category.findOne({ nome });
    if (!found) {
      await Category.create({ nome });
      console.log(`Categoria criada: ${nome}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seed concluido.');
}

run().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
