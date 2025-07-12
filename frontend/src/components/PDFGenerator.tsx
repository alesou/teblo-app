import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Invoice, Settings } from '../types';

interface PDFGeneratorProps {
  invoice: Invoice;
  settings: Settings;
  onGenerate?: () => void;
  hidden?: boolean;
}

const PDFGenerator = forwardRef<{ generatePDF: () => void, logoOk: boolean | undefined }, PDFGeneratorProps>(({ invoice, settings, onGenerate, hidden }, ref) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [logoOk, setLogoOk] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (settings.logoUrl) {
      fetch(settings.logoUrl, { method: 'HEAD' })
        .then(res => setLogoOk(res.ok))
        .catch(() => setLogoOk(false));
    } else {
      setLogoOk(false);
    }
  }, [settings.logoUrl]);
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');
  
  const calculateSubtotal = (item: any) => item.quantity * item.price;
  const calculateVAT = (item: any) => calculateSubtotal(item) * (item.vatRate / 100);
  const subtotal = invoice.items.reduce((sum: number, item: any) => sum + calculateSubtotal(item), 0);
  const totalIVA = invoice.items.reduce((sum: number, item: any) => sum + calculateVAT(item), 0);

  const paymentTerms = invoice.terms || settings?.terms || 'Pago: 30 días desde la fecha de la factura.';

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 295;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 295;
      }

      const safeClientName = invoice.client.name.replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`factura-${invoice.number}-para-${safeClientName}.pdf`);
      
      if (onGenerate) onGenerate();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  // Exponer logoOk al padre si lo necesita
  useImperativeHandle(ref, () => ({
    generatePDF,
    logoOk
  }));

  if (hidden) {
    return (
      <div style={{ display: 'none' }}>
        <div ref={invoiceRef}>
          {/* ... mismo contenido de la factura ... */}
          {/* Copiar el contenido visual de la factura aquí, igual que en el render normal */}
          <div className="bg-white p-8 rounded shadow border max-w-2xl mx-auto mt-4" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                {settings.logoUrl && logoOk && (
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
                <div>Fecha: {formatDate(invoice.date)}</div>
                {invoice.dueDate && <div>Vencimiento: {formatDate(invoice.dueDate)}</div>}
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
                  const sub = calculateSubtotal(item);
                  const iva = calculateVAT(item);
                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.price)}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.vatRate}%</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(sub)}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(iva)}</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(sub + iva)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="ml-auto max-w-xs">
              <div className="border border-gray-300 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>IVA:</span>
                  <span>{formatCurrency(totalIVA)}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-600 text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                {invoice.status === 'PAID' && invoice.amountPaid && (
                  <div className="flex justify-between mt-2">
                    <span>Cantidad pagada:</span>
                    <span>{formatCurrency(invoice.amountPaid)}</span>
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
              <div>{paymentTerms}</div>
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
              Factura generada por Teblo App
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!hidden && (
        <button
          onClick={generatePDF}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Generar PDF
        </button>
      )}
      <div ref={invoiceRef} className="bg-white p-8 rounded shadow border max-w-2xl mx-auto mt-4" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* ... mismo contenido visual de la factura ... */}
        {/* Copiar el contenido visual de la factura aquí, igual que en el render hidden */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            {settings.logoUrl && logoOk && (
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
            <div>Fecha: {formatDate(invoice.date)}</div>
            {invoice.dueDate && <div>Vencimiento: {formatDate(invoice.dueDate)}</div>}
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
              const sub = calculateSubtotal(item);
              const iva = calculateVAT(item);
              return (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{item.description}</td>
                  <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.price)}</td>
                  <td className="border border-gray-300 p-2 text-right">{item.vatRate}%</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(sub)}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(iva)}</td>
                  <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(sub + iva)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="ml-auto max-w-xs">
          <div className="border border-gray-300 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>IVA:</span>
              <span>{formatCurrency(totalIVA)}</span>
            </div>
            <div className="flex justify-between font-bold text-blue-600 text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.status === 'PAID' && invoice.amountPaid && (
              <div className="flex justify-between mt-2">
                <span>Cantidad pagada:</span>
                <span>{formatCurrency(invoice.amountPaid)}</span>
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
          <div>{paymentTerms}</div>
        </div>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Factura generada por Teblo App
        </div>
      </div>
    </div>
  );
});

export default PDFGenerator; 