import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Apply database schema migration
router.post('/apply-schema', async (req, res) => {
  try {
    console.log('Starting schema migration...');
    
    // This will apply the current schema to the database
    // Note: This is a simplified approach - in production you'd use proper migrations
    const result = await prisma.$executeRaw`
      -- Add userId column to clients table if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'clients' AND column_name = 'userid'
        ) THEN
          ALTER TABLE clients ADD COLUMN userid TEXT;
        END IF;
      END $$;
    `;
    
    const result2 = await prisma.$executeRaw`
      -- Add userId column to invoices table if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'invoices' AND column_name = 'userid'
        ) THEN
          ALTER TABLE invoices ADD COLUMN userid TEXT;
        END IF;
      END $$;
    `;
    
    console.log('Schema migration completed');
    
    res.json({
      success: true,
      message: 'Schema migration completed',
      clientsUpdated: result,
      invoicesUpdated: result2
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

export default router; 