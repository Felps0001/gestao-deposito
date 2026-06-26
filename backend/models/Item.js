import mongoose from 'mongoose';

// Colecao "items" -> Itens do deposito
const itemSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    qtde: { type: Number, default: 0, min: 0 },
    foto: { type: String, default: null },
    categoria: { type: String, default: null, trim: true },
    tipoUso: { type: String, default: null, trim: true },
    observacoes: { type: String, default: null },
  },
  { timestamps: true }
);

// Indice para acelerar buscas por nome/categoria
itemSchema.index({ nome: 'text', observacoes: 'text' });
itemSchema.index({ categoria: 1 });

export default mongoose.model('Item', itemSchema);
