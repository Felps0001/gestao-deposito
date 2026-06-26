import mongoose from 'mongoose';

// Colecao "categories" -> Categorias dos itens (ex.: Ferramentas, Limpeza...)
const categorySchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, unique: true, trim: true },
    descricao: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
