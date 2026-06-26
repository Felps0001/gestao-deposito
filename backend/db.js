import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'gestao_deposito';

if (!MONGODB_URI) {
  console.error('ERRO: defina MONGODB_URI no arquivo .env');
  process.exit(1);
}

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  console.log(`MongoDB conectado (banco: ${MONGODB_DB})`);
  return mongoose.connection;
}

export default mongoose;
