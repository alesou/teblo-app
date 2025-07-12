import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = 'logo' + '-' + Date.now() + ext;
      cb(null, name);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Get settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching settings' });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    const { companyName, companyNif, companyAddress, logoUrl, invoicePrefix, companyPhone, companyWeb } = req.body;
    const current = await prisma.settings.findFirst();
    if (!current) return res.status(404).json({ error: 'Settings not found' });
    const settings = await prisma.settings.update({
      where: { id: current.id },
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
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error updating settings' });
  }
});

// Endpoint para subir logo
router.post('/upload-logo', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
  // Construir URL accesible desde el frontend
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router; 