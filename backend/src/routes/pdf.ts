import express from 'express';
import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { railwayConfig } from '../config/railway';

const router = express.Router();
const prisma = new PrismaClient();

// Use Railway-optimized Puppeteer configuration
const getPuppeteerConfig = () => railwayConfig.puppeteer;

// Generate PDF for single invoice
router.get('/invoice/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: true
      }
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    });
    
    const html = generateInvoiceHTML(invoice, settings);
    
    const browser = await puppeteer.launch(getPuppeteerConfig());
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    // Personalizar el nombre del archivo con número de factura y nombre del cliente
    const safeClientName = invoice.client.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="factura-${invoice.number}-para-${safeClientName}.pdf"`);
    res.send(pdf);
    
  } catch (error) {
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

// Generate PDF for multiple invoices
router.post('/invoices', async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    
    if (!invoiceIds || !Array.isArray(invoiceIds)) {
      return res.status(400).json({ error: 'Invoice IDs array is required' });
    }
    
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds }
      },
      include: {
        client: true,
        items: true
      },
      orderBy: { date: 'desc' }
    });
    
    if (invoices.length === 0) {
      return res.status(404).json({ error: 'No invoices found' });
    }
    
    const settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    });
    
    const html = generateMultipleInvoicesHTML(invoices, settings);
    
    const browser = await puppeteer.launch(getPuppeteerConfig());
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facturas-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdf);
    
  } catch (error) {
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

function generateInvoiceHTML(invoice: any, settings: any) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');
  const calculateSubtotal = (item: any) => item.quantity * item.price;
  const calculateVAT = (item: any) => calculateSubtotal(item) * (item.vatRate / 100);
  const subtotal = invoice.items.reduce((sum: number, item: any) => sum + calculateSubtotal(item), 0);
  const totalIVA = invoice.items.reduce((sum: number, item: any) => sum + calculateVAT(item), 0);

  const logoHtml = settings?.logoUrl
    ? `<img src="${settings.logoUrl.startsWith('http') ? settings.logoUrl : 'http://localhost:3001' + settings.logoUrl}" alt="Logo" style="max-height:50px; max-width:140px; object-fit:contain; margin-bottom:8px; border-radius:8px; background:#fff; border:1px solid #e5e7eb;" />`
    : '';

  // Términos de pago
  const paymentTerms = invoice.terms || settings?.terms || 'Pago: 30 días desde la fecha de la factura.';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${invoice.number}</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;900&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Segoe UI', 'Arial', 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
          background: #fff;
          color: #222;
          font-size: 12px;
        }
        .pdf-container {
          max-width: 800px;
          margin: 16px auto;
          background: #fff;
          border-radius: 10px;
          box-shadow: none;
          padding: 24px 18px 18px 18px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
          margin-bottom: 18px;
        }
        .company-info {
          min-width: 180px;
        }
        .company-info h1 {
          font-family: 'Poppins', 'Segoe UI', 'Arial', 'Roboto', sans-serif;
          font-size: 1.2rem;
          margin: 0 0 4px 0;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .company-info div {
          font-size: 0.95rem;
          color: #444;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-title {
          font-family: 'Poppins', 'Segoe UI', 'Arial', 'Roboto', sans-serif;
          color: #2563eb;
          font-size: 1.2rem;
          font-weight: 900;
          margin-bottom: 2px;
          letter-spacing: 1px;
        }
        .invoice-number {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .status {
          display: inline-block;
          font-size: 0.85rem;
          padding: 2px 10px;
          border-radius: 8px;
          background: #eaf1fd;
          color: #2563eb;
          font-weight: 700;
          margin-top: 6px;
          letter-spacing: 0.5px;
        }
        .client-section {
          margin-bottom: 18px;
        }
        .client-box {
          background: #fff;
          border-radius: 8px;
          padding: 10px 14px;
          margin-top: 6px;
          border: 1px solid #e5e7eb;
        }
        .client-title {
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 2px;
          font-size: 0.95rem;
        }
        .client-name {
          font-weight: 800;
          font-size: 1rem;
          margin-bottom: 2px;
        }
        .client-box div {
          font-size: 0.95rem;
          color: #333;
        }
        .items-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 18px;
          font-size: 0.95rem;
        }
        .items-table th {
          background: #f6f8fa;
          color: #222;
          padding: 6px 4px;
          font-weight: 700;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          font-size: 0.95rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table th:not(:first-child) {
          border-left: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 6px 4px;
          border-bottom: 1px solid #e5e7eb;
          text-align: right;
          background: #fff;
        }
        .items-table td:first-child {
          text-align: left;
        }
        .items-table tr:nth-child(even) td {
          background: #fff;
        }
        .totals-box {
          margin-left: auto;
          max-width: 260px;
          background: #fff;
          border-radius: 6px;
          padding: 10px 12px 8px 12px;
          font-size: 1rem;
          border: 1px solid #e5e7eb;
          box-shadow: none;
        }
        .totals-box .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .totals-box .total-row {
          font-size: 1.1rem;
          font-weight: 900;
          color: #2563eb;
          background: #fff;
          border-radius: 6px;
          padding: 6px 0 6px 0;
          margin-top: 8px;
          letter-spacing: 1px;
          box-shadow: none;
        }
        .totals-box .total-row span:last-child {
          color: #2563eb;
        }
        .notes {
          margin-top: 12px;
          background: #fff;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.95rem;
          border: 1px solid #e5e7eb;
        }
        .terms {
          margin-top: 8px;
          background: #f6f8fa;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.95rem;
          border: 1px solid #e5e7eb;
        }
        .footer {
          margin-top: 16px;
          text-align: center;
          color: #bbb;
          font-size: 0.75rem;
          letter-spacing: 0.2px;
        }
        @media print {
          body { background: #fff; }
          .pdf-container { box-shadow: none; margin: 0; padding: 0; border-radius: 0; }
        }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="header">
          <div class="company-info">
            ${logoHtml}
            <h1>${settings?.companyName || ''}</h1>
            ${settings?.companyNif ? `<div>NIF: ${settings.companyNif}</div>` : ''}
            ${settings?.companyAddress ? `<div>${settings.companyAddress}</div>` : ''}
            ${settings?.companyPhone ? `<div>Tel: ${settings.companyPhone}</div>` : ''}
            ${settings?.companyWeb ? `<div>Web: ${settings.companyWeb}</div>` : ''}
          </div>
          <div class="invoice-info">
            <div class="invoice-title">FACTURA</div>
            <div class="invoice-number">Nº: <b>${invoice.number}</b></div>
            <div>Fecha: ${formatDate(invoice.date)}</div>
            ${invoice.dueDate ? `<div>Vencimiento: ${formatDate(invoice.dueDate)}</div>` : ''}
            <div class="status">${invoice.status === 'PAID' ? 'Pagada' : invoice.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}</div>
          </div>
        </div>
        <div class="client-section">
          <div class="client-title">Cliente</div>
          <div class="client-box">
            <div class="client-name">${invoice.client.name}</div>
            ${invoice.client.nif ? `<div>NIF/CIF: ${invoice.client.nif}</div>` : ''}
            ${invoice.client.address ? `<div>Dirección: ${invoice.client.address}</div>` : ''}
            ${invoice.client.email ? `<div>Email: ${invoice.client.email}</div>` : ''}
            ${invoice.client.phone ? `<div>Teléfono: ${invoice.client.phone}</div>` : ''}
          </div>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>IVA (%)</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => {
              const sub = calculateSubtotal(item);
              const iva = calculateVAT(item);
              return `<tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${item.vatRate}%</td>
                <td>${formatCurrency(sub)}</td>
                <td>${formatCurrency(iva)}</td>
                <td><b>${formatCurrency(sub + iva)}</b></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="totals-box">
          <div class="row"><span>Subtotal:</span><span>${formatCurrency(subtotal)}</span></div>
          <div class="row"><span>IVA:</span><span>${formatCurrency(totalIVA)}</span></div>
          <div class="row total-row"><span>Total:</span><span>${formatCurrency(invoice.total)}</span></div>
          ${invoice.status === 'PAID' && invoice.amountPaid ? `<div class="row"><span>Cantidad pagada:</span><span>${formatCurrency(invoice.amountPaid)}</span></div>` : ''}
        </div>
        ${invoice.notes ? `<div class="notes"><b>Notas:</b> ${invoice.notes}</div>` : ''}
        <div class="terms"><b>Términos de pago:</b> ${paymentTerms}</div>
        <div class="footer">Factura generada por Teblo App</div>
      </div>
    </body>
    </html>
  `;
}

function generateMultipleInvoicesHTML(invoices: any[], settings: any) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES');
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facturas</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice {
          page-break-after: always;
          margin-bottom: 40px;
        }
        .invoice:last-child {
          page-break-after: avoid;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
        }
        .company-info {
          flex: 1;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-number {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .client-info {
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background-color: #2563eb;
          color: white;
          padding: 12px;
          text-align: left;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .totals {
          text-align: right;
          margin-top: 30px;
        }
        .total-row {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
        }
        .notes {
          margin-top: 30px;
          padding: 15px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      ${invoices.map(invoice => `
        <div class="invoice">
          <div class="header">
            <div class="company-info">
              <h1>${settings?.companyName || 'Mi Empresa'}</h1>
              ${settings?.companyNif ? `<p><strong>NIF:</strong> ${settings.companyNif}</p>` : ''}
              ${settings?.companyAddress ? `<p>${settings.companyAddress}</p>` : ''}
            </div>
            <div class="invoice-info">
              <div class="invoice-number">FACTURA</div>
              <p><strong>Número:</strong> ${invoice.number}</p>
              <p><strong>Fecha:</strong> ${formatDate(invoice.date)}</p>
              ${invoice.dueDate ? `<p><strong>Vencimiento:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
            </div>
          </div>
          
          <div class="client-info">
            <h3>Cliente</h3>
            <p><strong>${invoice.client.name}</strong></p>
            ${invoice.client.nif ? `<p><strong>NIF/CIF:</strong> ${invoice.client.nif}</p>` : ''}
            ${invoice.client.address ? `<p><strong>Dirección:</strong> ${invoice.client.address}</p>` : ''}
            ${invoice.client.email ? `<p><strong>Email:</strong> ${invoice.client.email}</p>` : ''}
            ${invoice.client.phone ? `<p><strong>Teléfono:</strong> ${invoice.client.phone}</p>` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>IVA %</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item: any) => {
                const subtotal = item.quantity * item.price;
                const vat = subtotal * (item.vatRate / 100);
                return `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${item.vatRate}%</td>
                    <td>${formatCurrency(subtotal)}</td>
                    <td>${formatCurrency(vat)}</td>
                    <td>${formatCurrency(subtotal + vat)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <strong>TOTAL: ${formatCurrency(invoice.total)}</strong>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="notes">
              <h4>Notas:</h4>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

export default router; 