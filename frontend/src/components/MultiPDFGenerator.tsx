import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Invoice, Settings } from '../types';

interface MultiPDFGeneratorProps {
  invoices: Invoice[];
  settings: Settings;
  onClose: () => void;
}

const MultiPDFGenerator: React.FC<MultiPDFGeneratorProps> = ({ invoices, settings, onClose }) => {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const generateMultiPDF = async () => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      for (let i = 0; i < invoices.length; i++) {
        const ref = refs.current[i];
        if (!ref) continue;
        const canvas = await html2canvas(ref, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let position = 0;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      }
      pdf.save(`facturas-multiples-${new Date().toISOString().split('T')[0]}.pdf`);
      onClose();
    };
    generateMultiPDF();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ display: 'none' }}>
      {invoices.map((invoice, idx) => (
        <div
          key={invoice.id}
          ref={el => (refs.current[idx] = el)}
        >
          <div className="bg-white p-8 rounded shadow border max-w-2xl mx-auto mt-4" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                {settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="mb-2 max-h-14 max-w-xs rounded bg-white border border-gray-100"
                    style={{ objectFit: "contain" }}
                  />
                )}
                <div className="font-bold text-lg">{settings.companyName}</div>
                {settings.companyNif && <div className="text-sm">NIF: {settings.companyNif}</div>}
                {settings.companyAddress && <div className="text-sm">{settings.companyAddress}</div>}
                {settings.companyPhone && <div className="text-sm">Tel: {settings.companyPhone}</div>}
                {settings.companyWeb && <div className="text-sm">Web: {settings.companyWeb}</div>}
              </div>
              <div className="text-right">
                <div className="text-blue-600 font-bold text-lg">FACTURA</div>
                <div className="font-bold">Nº: {invoice.number}</div>
                <div>Fecha: {new Date(invoice.date).toLocaleDateString('es-ES')}</div>
                {invoice.dueDate && <div>Vencimiento: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}</div>}
                <div className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold mt-2">
                  {invoice.status === 'PAID' ? 'Pagada' : invoice.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="font-bold text-blue-600 mb-2">Cliente</div>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-bold">{invoice.client.name}</div>
                {invoice.client.nif && <div>NIF/CIF: {invoice.client.nif}</div>}
                {invoice.client.address && <div>Dirección: {invoice.client.address}</div>}
                {invoice.client.email && <div>Email: {invoice.client.email}</div>}
                {invoice.client.phone && <div>Teléfono: {invoice.client.phone}</div>}
              </div>
            </div>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Descripción</th>
                  <th className="border border-gray-300 p-2 text-right">Cantidad</th>
                  <th className="border border-gray-300 p-2 text-right">Precio</th>
                  <th className="border border-gray-300 p-2 text-right">IVA (%)</th>
                  <th className="border border-gray-300 p-2 text-right">Subtotal</th>
                  <th className="border border-gray-300 p-2 text-right">IVA</th>
                  <th className="border border-gray-300 p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => {
                  const sub = item.quantity * item.price;
                  const iva = sub * (item.vatRate / 100);
                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.price.toFixed(2)} €</td>
                      <td className="border border-gray-300 p-2 text-right">{item.vatRate}%</td>
                      <td className="border border-gray-300 p-2 text-right">{sub.toFixed(2)} €</td>
                      <td className="border border-gray-300 p-2 text-right">{iva.toFixed(2)} €</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">{(sub + iva).toFixed(2)} €</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="ml-auto max-w-xs">
              <div className="border border-gray-300 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>{invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>IVA:</span>
                  <span>{invoice.items.reduce((sum, item) => sum + item.quantity * item.price * (item.vatRate / 100), 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-blue-600 text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{invoice.total.toFixed(2)} €</span>
                </div>
                {invoice.status === 'PAID' && invoice.amountPaid && (
                  <div className="flex justify-between mt-2">
                    <span>Cantidad pagada:</span>
                    <span>{invoice.amountPaid.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            </div>
            {invoice.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded border">
                <div className="font-bold">Notas:</div>
                <div>{invoice.notes}</div>
              </div>
            )}
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              <div className="font-bold">Términos de pago:</div>
              <div>{invoice.terms || settings.terms || 'Pago: 30 días desde la fecha de la factura.'}</div>
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
              Factura generada por Teblo App
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultiPDFGenerator; 