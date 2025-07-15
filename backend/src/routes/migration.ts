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

export default router; 