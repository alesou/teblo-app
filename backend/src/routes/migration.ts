import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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