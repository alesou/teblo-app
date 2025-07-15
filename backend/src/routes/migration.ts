import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Migration endpoint to assign userId to existing data
router.post('/migrate-data', async (req, res) => {
  try {
    console.log('Starting data migration...');
    
    // Get a temporary userId (you can replace this with a real user ID)
    const tempUserId = 'temp-user-id';
    
    // Update existing clients without userId
    const clientsToUpdate = await prisma.client.findMany({
      where: {
        OR: [
          { userId: '' },
          { userId: null as any }
        ]
      }
    });
    
    let clientsUpdated = 0;
    for (const client of clientsToUpdate) {
      await prisma.client.update({
        where: { id: client.id },
        data: { userId: tempUserId }
      });
      clientsUpdated++;
    }
    
    console.log(`Updated ${clientsUpdated} clients`);
    
    // Update existing invoices without userId
    const invoicesToUpdate = await prisma.invoice.findMany({
      where: {
        OR: [
          { userId: '' },
          { userId: null as any }
        ]
      }
    });
    
    let invoicesUpdated = 0;
    for (const invoice of invoicesToUpdate) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { userId: tempUserId }
      });
      invoicesUpdated++;
    }
    
    console.log(`Updated ${invoicesUpdated} invoices`);
    
    res.json({
      success: true,
      message: 'Migration completed',
      clientsUpdated: clientsUpdated,
      invoicesUpdated: invoicesUpdated
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 