import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import admin from '../config/firebase';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación
interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authenticate = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req: Request, file: Express.Multer.File, cb: any) => {
      const ext = path.extname(file.originalname);
      const name = 'logo' + '-' + Date.now() + ext;
      cb(null, name);
    }
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Get settings for the authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const settings = await prisma.settings.findUnique({
      where: { userId: req.userId }
    });

    // Si no existen settings para este usuario, crear unos por defecto
    if (!settings) {
      const defaultSettings = await prisma.settings.create({
        data: {
          userId: req.userId,
          companyName: "Mi Empresa",
          companyNif: "",
          companyAddress: "",
          logoUrl: "",
          invoicePrefix: "FAC",
          nextNumber: 1,
          companyPhone: "",
          companyWeb: ""
        }
      });
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error fetching settings' });
  }
});

// Update settings for the authenticated user
router.put('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { companyName, companyNif, companyAddress, logoUrl, invoicePrefix, companyPhone, companyWeb } = req.body;
    
    // Buscar settings existentes para este usuario
    const existingSettings = await prisma.settings.findUnique({
      where: { userId: req.userId }
    });

    let settings;
    if (existingSettings) {
      // Actualizar settings existentes
      settings = await prisma.settings.update({
        where: { userId: req.userId },
        data: {
          companyName,
          companyNif,
          companyAddress,
          logoUrl,
          invoicePrefix,
          companyPhone,
          companyWeb
        }
      });
    } else {
      // Crear nuevos settings para este usuario
      settings = await prisma.settings.create({
        data: {
          userId: req.userId,
          companyName,
          companyNif,
          companyAddress,
          logoUrl,
          invoicePrefix,
          companyPhone,
          companyWeb
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Error updating settings' });
  }
});

// Endpoint para subir logo
router.post('/upload-logo', authenticate, upload.single('logo'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
  // Construir URL accesible desde el frontend
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router; 