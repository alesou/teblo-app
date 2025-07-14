import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Buscar facturas por nombre, total o fecha
router.get('/search', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { q, date, total } = req.query;
    const where: any = { userId: req.userId };
    if (q) {
      where.OR = [
        { number: { contains: q } },
        { client: { name: { contains: q } } }
      ];
    }
    if (date) {
      where.date = { equals: new Date(date as string) };
    }
    if (total) {
      where.total = { equals: parseFloat(total as string) };
    }
    const invoices = await prisma.invoice.findMany({
      where,
      include: { client: true, items: true },
      orderBy: { date: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error buscando facturas' });
  }
});

// Get all invoices (con filtro por clientId opcional)
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { clientId } = req.query;
    const where: any = { userId: req.userId };
    if (clientId) where.clientId = clientId;
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoices' });
  }
});

// Get invoice by ID
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: true
      }
    });
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoice' });
  }
});

// Create new invoice
router.post('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { clientId, date, dueDate, items, notes, terms, amountPaid, paidAt, status } = req.body;
    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Client and items are required' });
    }
    // Get next invoice number
    const settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    });
    const invoiceNumber = `${settings?.invoicePrefix || 'FAC'}-${settings?.nextNumber || 1}`;
    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      const subtotal = item.quantity * item.price;
      const vat = subtotal * (item.vatRate / 100);
      return sum + subtotal + vat;
    }, 0);
    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        total,
        amountPaid,
        paidAt: paidAt ? new Date(paidAt) : null,
        status: status || 'PENDING',
        notes,
        terms,
        clientId,
        userId: req.userId,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            vatRate: item.vatRate
          }))
        }
      },
      include: {
        client: true,
        items: true
      }
    });
    // Update next number
    await prisma.settings.update({
      where: { id: 'settings' },
      data: { nextNumber: (settings?.nextNumber || 1) + 1 }
    });
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Error creating invoice', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update invoice
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { date, dueDate, status, notes, items, total, amountPaid, paidAt } = req.body;
    // Verificar propiedad
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Delete existing items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    });
    // Calculate new total
    const newTotal = items.reduce((sum: number, item: any) => {
      const subtotal = item.quantity * item.price;
      const vat = subtotal * (item.vatRate / 100);
      return sum + subtotal + vat;
    }, 0);
    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        total: newTotal,
        amountPaid,
        paidAt: paidAt ? new Date(paidAt) : null,
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            vatRate: item.vatRate
          }))
        }
      },
      include: {
        client: true,
        items: true
      }
    });
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Error updating invoice' });
  }
});

// Update invoice status
router.patch('/:id/status', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // Verificar propiedad
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        items: true
      }
    });
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Error updating invoice status' });
  }
});

// Delete invoice
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    // Verificar propiedad
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.invoice.delete({
      where: { id }
    });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting invoice' });
  }
});

// Añadir pago a una factura
router.post('/:id/payments', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    // Verificar propiedad
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { amount, date, type, note } = req.body;
    if (!amount || !date || !type) return res.status(400).json({ error: 'Datos de pago incompletos' });
    const payment = await prisma.payment.create({
      data: {
        invoiceId: id,
        amount,
        date: new Date(date),
        type,
        note
      }
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Error añadiendo pago' });
  }
});
// Obtener historial de pagos de una factura
router.get('/:id/payments', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    // Verificar propiedad
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const payments = await prisma.payment.findMany({
      where: { invoiceId: id },
      orderBy: { date: 'asc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial de pagos' });
  }
});

export default router; 