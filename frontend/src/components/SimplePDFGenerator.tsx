import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Invoice, Settings } from '../types';

interface SimplePDFGeneratorProps {
  invoice: Invoice;
  settings: Settings;
}

const SimplePDFGenerator: React.FC<SimplePDFGeneratorProps> = ({ invoice, settings }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      // Esperar un momento para asegurar que el contenido esté renderizado
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(contentRef.current, {
        scale: 1, // Menor resolución para menor peso
        useCORS: false,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0
      });

      // Exportar como JPEG (mucho más ligero que PNG)
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // 85% calidad
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190; // Margen de 10mm a cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Usar compresión 'FAST' si está disponible
      try {
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight, undefined, 'FAST');
      } catch {
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      }
      
      const safeClientName = invoice.client.name.replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`factura-${invoice.number}-${safeClientName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intente de nuevo.');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalIVA = invoice.items.reduce((sum, item) => sum + item.quantity * item.price * (item.vatRate / 100), 0);

  return (
    <div className="space-y-4">
      <button
        onClick={generatePDF}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Descargar PDF
      </button>

      <div ref={contentRef} className="bg-white p-8 shadow-lg" style={{ width: '210mm', margin: '0 auto' }}>
        {/* Encabezado */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold">{settings.companyName}</h1>
            {settings.companyNif && <p>NIF: {settings.companyNif}</p>}
            {settings.companyAddress && <p>{settings.companyAddress}</p>}
            {settings.companyPhone && <p>Tel: {settings.companyPhone}</p>}
            {settings.companyWeb && <p>Web: {settings.companyWeb}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">FACTURA</h2>
            <p><strong>Nº:</strong> {invoice.number}</p>
            <p><strong>Fecha:</strong> {formatDate(invoice.date)}</p>
            {invoice.dueDate && <p><strong>Vencimiento:</strong> {formatDate(invoice.dueDate)}</p>}
            <span className={`inline-block mt-2 px-3 py-1 rounded text-sm font-semibold ${
              invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
              invoice.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {invoice.status === 'PAID' ? 'Pagada' :
               invoice.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="bg-gray-50 p-4 rounded mb-8">
          <h3 className="font-bold mb-2">Cliente</h3>
          <p className="font-semibold">{invoice.client.name}</p>
          {invoice.client.nif && <p>NIF/CIF: {invoice.client.nif}</p>}
          {invoice.client.address && <p>{invoice.client.address}</p>}
          {invoice.client.email && <p>Email: {invoice.client.email}</p>}
          {invoice.client.phone && <p>Tel: {invoice.client.phone}</p>}
        </div>

        {/* Tabla de conceptos */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="p-3 text-left">Descripción</th>
              <th className="p-3 text-right">Cantidad</th>
              <th className="p-3 text-right">Precio</th>
              <th className="p-3 text-right">IVA %</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const itemSubtotal = item.quantity * item.price;
              const itemIVA = itemSubtotal * (item.vatRate / 100);
              const itemTotal = itemSubtotal + itemIVA;
              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="p-3 text-right">{item.vatRate}%</td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end mb-8">
          <div className="w-64 bg-gray-50 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>IVA:</span>
              <span>{formatCurrency(totalIVA)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notas y términos */}
        {invoice.notes && (
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-1">Notas:</h4>
            <p>{invoice.notes}</p>
          </div>
        )}

        {invoice.terms && (
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-1">Términos de pago:</h4>
            <p>{invoice.terms}</p>
          </div>
        )}

        {/* Pie de página */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Factura generada por Teblo App</p>
        </div>
      </div>
    </div>
  );
};

export default SimplePDFGenerator; 