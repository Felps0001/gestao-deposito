import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token nao fornecido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido ou expirado' });
  }
}

// Pronto para uso futuro (item 9): exige que o usuario autenticado seja admin.
// Para funcionar, inclua "role" no payload do token (em routes/auth.js) e
// aplique este middleware depois de authRequired nas rotas protegidas.
// Ex.: router.post('/', authRequired, adminRequired, handler)
export function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}
