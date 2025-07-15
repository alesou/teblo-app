import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Inicializar Firebase Admin solo si no está inicializado
if (!admin.apps.length) {
  // Configurar Firebase Admin con credenciales de Railway
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccount) {
    try {
      const serviceAccountJson = JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
    } catch (error) {
      console.error('Error parsing Firebase service account:', error);
      // Fallback para desarrollo local
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  } else {
    // Fallback para desarrollo local
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('Auth middleware called for:', req.path);
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No authorization header or invalid format');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token received, length:', token.length);
  
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log('Token verified successfully for user:', decoded.uid);
    req.userId = decoded.uid;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 