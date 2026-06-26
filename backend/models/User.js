import mongoose from 'mongoose';

// Colecao "users" -> Login do sistema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
