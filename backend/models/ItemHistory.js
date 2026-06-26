import mongoose from 'mongoose';

// Subdocumento que descreve uma alteracao de campo
const alteracaoSchema = new mongoose.Schema(
  {
    campo: { type: String, required: true },
    de: { type: String, default: null },
    para: { type: String, default: null },
  },
  { _id: false }
);

// Colecao "itemhistories" -> Historico de alteracoes dos itens
const itemHistorySchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    acao: { type: String, enum: ['criado', 'atualizado'], required: true },
    alteracoes: { type: [alteracaoSchema], default: [] },
    usuario: { type: String, default: null },
  },
  { timestamps: true }
);

itemHistorySchema.index({ item: 1, createdAt: -1 });

export default mongoose.model('ItemHistory', itemHistorySchema);
