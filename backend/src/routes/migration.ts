import express from 'express';
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

export default router; 