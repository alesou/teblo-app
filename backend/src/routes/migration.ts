import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Apply database schema migration
router.post('/apply-schema', async (req, res) => {
  try {
    console.log('Starting schema migration...');
    
    // Add userId column to clients table
    try {
      await prisma.$executeRaw`ALTER TABLE clients ADD COLUMN "userId" TEXT`;
      console.log('Added userId column to clients table');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('userId column already exists in clients table');
      } else {
        throw error;
      }
    }
    
    // Add userId column to invoices table
    try {
      await prisma.$executeRaw`ALTER TABLE invoices ADD COLUMN "userId" TEXT`;
      console.log('Added userId column to invoices table');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('userId column already exists in invoices table');
      } else {
        throw error;
      }
    }
    
    // Force Prisma client regeneration
    console.log('Regenerating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('Schema migration completed');
    
    res.json({
      success: true,
      message: 'Schema migration completed successfully'
    });
    
  } catch (error) {
    console.error('Schema migration error:', error);
    res.status(500).json({ 
      error: 'Schema migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clean data endpoint to remove all existing data
router.post('/clean-data', async (req, res) => {
  try {
    console.log('Starting data cleanup...');
    
    // Delete all existing invoices (this will cascade to invoice items and payments)
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`Deleted ${deletedInvoices.count} invoices`);
    
    // Delete all existing clients
    const deletedClients = await prisma.client.deleteMany({});
    console.log(`Deleted ${deletedClients.count} clients`);
    
    res.json({
      success: true,
      message: 'Data cleanup completed',
      invoicesDeleted: deletedInvoices.count,
      clientsDeleted: deletedClients.count
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Diagnostic endpoint to check database schema
router.get('/check-schema', async (req, res) => {
  try {
    console.log('Checking database schema...');
    
    // Check if userId column exists in clients table
    const clientsResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name = 'userId'
    `;
    
    // Check if userId column exists in invoices table
    const invoicesResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'invoices' AND column_name = 'userId'
    `;
    
    console.log('Clients columns:', clientsResult);
    console.log('Invoices columns:', invoicesResult);
    
    res.json({
      success: true,
      clients: {
        hasUserId: Array.isArray(clientsResult) && clientsResult.length > 0,
        columns: clientsResult
      },
      invoices: {
        hasUserId: Array.isArray(invoicesResult) && invoicesResult.length > 0,
        columns: invoicesResult
      }
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({ 
      error: 'Schema check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint para migrar la tabla settings
router.post('/migrate-settings', async (req: Request, res: Response) => {
  try {
    console.log('Starting settings migration...');
    
    // Verificar si la columna userId ya existe
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND column_name = 'userId'
    `;
    
    if (Array.isArray(tableInfo) && tableInfo.length > 0) {
      console.log('userId column already exists');
      return res.json({ message: 'Settings table already migrated' });
    }
    
    // Agregar la columna userId
    await prisma.$executeRaw`ALTER TABLE settings ADD COLUMN "userId" TEXT`;
    console.log('Added userId column');
    
    // Crear índice único en userId
    await prisma.$executeRaw`CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId")`;
    console.log('Created unique index on userId');
    
    // Cambiar el ID por defecto de "settings" a UUID
    await prisma.$executeRaw`ALTER TABLE settings ALTER COLUMN id SET DEFAULT gen_random_uuid()`;
    console.log('Changed id default to UUID');
    
    // Actualizar el registro existente para que tenga un UUID válido
    await prisma.$executeRaw`UPDATE settings SET id = gen_random_uuid() WHERE id = 'settings'`;
    console.log('Updated existing settings record with UUID');
    
    console.log('Settings migration completed successfully');
    res.json({ message: 'Settings migration completed successfully' });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed', details: error });
  }
});

// Endpoint para limpiar datos de settings (para testing)
router.post('/clean-settings', async (req: Request, res: Response) => {
  try {
    console.log('Cleaning settings table...');
    
    // Eliminar todos los registros de settings
    await prisma.settings.deleteMany({});
    console.log('Cleaned settings table');
    
    res.json({ message: 'Settings table cleaned successfully' });
    
  } catch (error) {
    console.error('Clean error:', error);
    res.status(500).json({ error: 'Clean failed', details: error });
  }
});

// Endpoint para verificar el estado de la tabla settings
router.get('/check-settings', async (req: Request, res: Response) => {
  try {
    console.log('Checking settings table structure...');
    
    // Verificar estructura de la tabla
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'settings'
      ORDER BY ordinal_position
    `;
    
    // Verificar registros existentes
    const settings = await prisma.settings.findMany();
    
    res.json({ 
      columns: columns,
      records: settings.length,
      settings: settings
    });
    
  } catch (error) {
    console.error('Check error:', error);
    res.status(500).json({ error: 'Check failed', details: error });
  }
});

export default router; 