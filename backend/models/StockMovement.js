import mongoose from 'mongoose';

// Colecao "stockmovements" -> Movimentacoes de estoque (entrada/saida)
const stockMovementSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    tipo: { type: String, enum: ['entrada', 'saida'], required: true },
    quantidade: { type: Number, required: true, min: 1 },
    saldoApos: { type: Number, required: true, min: 0 },
    usuario: { type: String, default: null },
    observacao: { type: String, default: null },
  },
  { timestamps: true }
);

stockMovementSchema.index({ item: 1, createdAt: -1 });

export default mongoose.model('StockMovement', stockMovementSchema);
