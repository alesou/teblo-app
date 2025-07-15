import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get all clients
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Fetching clients for userId:', req.userId);
    
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${clients.length} clients for user ${req.userId}`);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Error fetching clients' });
  }
});

// Get client by ID
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findFirst({
      where: { 
        id,
        userId: req.userId 
      },
      include: {
        invoices: {
          orderBy: { date: 'desc' }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching client' });
  }
});

// Create new client
router.post('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, nif, address, email, phone } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const client = await prisma.client.create({
      data: {
        name,
        nif,
        address,
        email,
        phone,
        userId: req.userId!
      }
    });
    
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error creating client' });
  }
});

// Update client
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, nif, address, email, phone } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Verify client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: { 
        id,
        userId: req.userId 
      }
    });
    
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        nif,
        address,
        email,
        phone
      }
    });
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error updating client' });
  }
});

// Delete client
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    // Verify client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: { 
        id,
        userId: req.userId 
      }
    });
    
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Check if client has invoices
    const invoices = await prisma.invoice.findMany({
      where: { clientId: id }
    });
    
    if (invoices.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete client with existing invoices' 
      });
    }
    
    await prisma.client.delete({
      where: { id }
    });
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting client' });
  }
});

export default router; 