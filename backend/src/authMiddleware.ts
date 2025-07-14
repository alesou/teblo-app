import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Inicializar Firebase Admin solo si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId = decoded.uid;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 