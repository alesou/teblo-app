import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoicesApi, clientsApi, settingsApi } from '../services/api';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice, Settings } from '../types';

// Registrar fuentes del sistema
Font.register({
  family: 'Helvetica',
  src: 'Helvetica'
});

Font.register({
  family: 'Helvetica-Bold',
  src: 'Helvetica-Bold'
});

// Estilos para el PDF (copiados del NativePDFGenerator)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '1 solid #e0e0e0',
    paddingBottom: 20
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2
  },
  invoiceHeader: {
    flex: 1,
    alignItems: 'flex-end'
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 10
  },
  invoiceDetails: {
    fontSize: 9,
    marginBottom: 2
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '3 8',
    borderRadius: 3,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginTop: 5
  },
  clientSection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    marginBottom: 25,
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#2563eb'
  },
  clientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3
  },
  clientDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2
  },
  table: {
    marginBottom: 25
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    borderBottom: '1 solid #d1d5db',
    paddingVertical: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 6
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 9
  },
  tableCellRight: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 9,
    textAlign: 'right'
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 25
  },
  totalsBox: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 5,
    width: 200
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderTop: '1 solid #d1d5db',
    paddingTop: 5
  },
  totalAmount: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb'
  },
  notesSection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5
  },
  notesText: {
    fontSize: 9,
    color: '#666'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af'
  }
});

// Componente para el contenido del PDF
const InvoicePDF = ({ invoice, settings }: { invoice: Invoice; settings: Settings }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalIVA = invoice.items.reduce((sum, item) => sum + item.quantity * item.price * (item.vatRate / 100), 0);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pagada';
      case 'CANCELLED': return 'Cancelada';
      default: return 'Pendiente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'CANCELLED': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{settings.companyName}</Text>
            {settings.companyNif && <Text style={styles.companyDetails}>NIF: {settings.companyNif}</Text>}
            {settings.companyAddress && <Text style={styles.companyDetails}>{settings.companyAddress}</Text>}
            {settings.companyPhone && <Text style={styles.companyDetails}>Tel: {settings.companyPhone}</Text>}
            {settings.companyWeb && <Text style={styles.companyDetails}>Web: {settings.companyWeb}</Text>}
          </View>
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceDetails}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Nº:</Text> {invoice.number}</Text>
            <Text style={styles.invoiceDetails}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Fecha:</Text> {formatDate(invoice.date)}</Text>
            {invoice.dueDate && (
              <Text style={styles.invoiceDetails}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Vencimiento:</Text> {formatDate(invoice.dueDate)}
              </Text>
            )}
            <View style={[styles.statusBadge, getStatusColor(invoice.status)]}>
              <Text>{getStatusText(invoice.status)}</Text>
            </View>
          </View>
        </View>

        {/* Datos del cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.clientName}>{invoice.client.name}</Text>
          {invoice.client.nif && <Text style={styles.clientDetails}>NIF/CIF: {invoice.client.nif}</Text>}
          {invoice.client.address && <Text style={styles.clientDetails}>{invoice.client.address}</Text>}
          {invoice.client.email && <Text style={styles.clientDetails}>Email: {invoice.client.email}</Text>}
          {invoice.client.phone && <Text style={styles.clientDetails}>Tel: {invoice.client.phone}</Text>}
        </View>

        {/* Tabla de conceptos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>Descripción</Text>
            <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>Cantidad</Text>
            <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>Precio</Text>
            <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>IVA %</Text>
            <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>Total</Text>
          </View>
          {invoice.items.map((item, index) => {
            const itemSubtotal = item.quantity * item.price;
            const itemIVA = itemSubtotal * (item.vatRate / 100);
            const itemTotal = itemSubtotal + itemIVA;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.description}</Text>
                <Text style={styles.tableCellRight}>{item.quantity}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(item.price)}</Text>
                <Text style={styles.tableCellRight}>{item.vatRate}%</Text>
                <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(itemTotal)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>IVA:</Text>
              <Text>{formatCurrency(totalIVA)}</Text>
            </View>
            <View style={styles.totalRowBold}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Notas y términos */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notas:</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {invoice.terms && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Términos de pago:</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Pie de página */}
        <Text style={styles.footer}>Factura generada por Teblo App</Text>
      </Page>
    </Document>
  );
};

interface Concepto {
  descripcion: string;
  cantidad: number;
  precio: number;
  iva: number;
}

interface Cliente {
  id: string;
  name: string;
}

const initialConcepto = { descripcion: "", cantidad: 1, precio: 0, iva: 21 };

const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [conceptos, setConceptos] = useState<Concepto[]>([{ ...initialConcepto }]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [terminos, setTerminos] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showPDFDownload, setShowPDFDownload] = useState(false);

  useEffect(() => {
    clientsApi.getAll().then(data => setClientes(data));
  }, []);

  const handleConceptoChange = (idx: number, field: keyof Concepto, value: any) => {
    setConceptos(conceptos.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addConcepto = () => setConceptos([...conceptos, { ...initialConcepto }]);
  const removeConcepto = (idx: number) => setConceptos(conceptos.filter((_, i) => i !== idx));

  const subtotal = conceptos.reduce((sum, c) => sum + c.cantidad * c.precio, 0);
  const totalIVA = conceptos.reduce((sum, c) => sum + (c.cantidad * c.precio * c.iva) / 100, 0);
  const total = subtotal + totalIVA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) return alert("Selecciona un cliente");
    if (conceptos.length === 0 || conceptos.some(c => !c.descripcion || c.cantidad <= 0)) {
      return alert("Añade al menos un concepto válido");
    }
    
    setSaving(true);
    try {
      // Crear factura en backend
      const newInvoice = await invoicesApi.create({
        clientId: clienteId,
        date: fecha,
        dueDate: undefined, // No null, para evitar error de tipo
        items: conceptos.map(c => ({
          description: c.descripcion,
          quantity: c.cantidad,
          price: c.precio,
          vatRate: c.iva
        })),
        notes: notas,
        terms: terminos // Añadir términos de pago
      });

      // Obtener configuración para el PDF
      const settingsData = await settingsApi.get();
      setSettings(settingsData);
      setCreatedInvoice(newInvoice);
      setShowPDFDownload(true);

      // Mostrar mensaje de éxito
      alert("Factura guardada exitosamente. El PDF se descargará automáticamente.");
      
    } catch (err) {
      alert("Error al guardar la factura");
    } finally {
      setSaving(false);
    }
  };

  const handleClosePDF = () => {
    setShowPDFDownload(false);
    setCreatedInvoice(null);
    setSettings(null);
    // Redirigir a la página de facturas
    navigate('/invoices');
  };

  // Si estamos mostrando la descarga del PDF
  if (showPDFDownload && createdInvoice && settings) {
    const safeClientName = createdInvoice.client.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `factura-${createdInvoice.number}-${safeClientName}.pdf`;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Factura creada exitosamente</h3>
          <p className="text-gray-600 mb-6">
            La factura se ha guardado correctamente. Ahora puedes descargar el PDF.
          </p>
          
          <div className="flex space-x-3">
            <PDFDownloadLink
              document={<InvoicePDF invoice={createdInvoice} settings={settings} />}
              fileName={fileName}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-center"
            >
              {({ loading }) =>
                loading ? 'Generando PDF...' : 'Descargar PDF'
              }
            </PDFDownloadLink>
            
            <button
              onClick={handleClosePDF}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear factura</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium">Cliente</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            required
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Fecha</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Conceptos</label>
          {/* Etiquetas de los campos */}
          <div className="flex gap-2 mb-2 text-xs font-medium text-gray-600 items-end">
            <div className="flex-1 flex flex-col items-start">
              <span>Descripción</span>
            </div>
            <div className="w-16 flex flex-col items-center">
              <span>Cantidad</span>
            </div>
            <div className="w-24 flex flex-col items-center">
              <span>Precio</span>
            </div>
            <div className="w-20 flex flex-col items-center">
              <span>IVA %</span>
            </div>
            <div className="w-16"></div>
          </div>
          {conceptos.map((c, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Descripción"
                value={c.descripcion}
                onChange={e => handleConceptoChange(idx, "descripcion", e.target.value)}
                required
              />
              <input
                type="number"
                className="border rounded px-2 py-1 w-16"
                min={1}
                value={c.cantidad}
                onChange={e => handleConceptoChange(idx, "cantidad", Number(e.target.value))}
                required
              />
              <input
                type="number"
                className="border rounded px-2 py-1 w-24"
                min={0}
                step={0.01}
                value={c.precio}
                onChange={e => handleConceptoChange(idx, "precio", Number(e.target.value))}
                required
              />
              <div className="w-20 flex items-center">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-14 text-right"
                  min={0}
                  max={21}
                  value={c.iva}
                  onChange={e => handleConceptoChange(idx, "iva", Number(e.target.value))}
                  required
                />
                <span className="ml-1 text-gray-600">%</span>
              </div>
              {conceptos.length > 1 && (
                <button type="button" className="text-red-600 ml-2" onClick={() => removeConcepto(idx)}>
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button type="button" className="text-blue-600 mt-2" onClick={addConcepto}>
            + Añadir otro concepto
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Notas</label>
            <textarea
              className="border rounded px-3 py-2 w-full"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Notas u observaciones"
              rows={2}
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Términos de pago</label>
            <textarea
              className="border rounded px-3 py-2 w-full"
              value={terminos}
              onChange={e => setTerminos(e.target.value)}
              placeholder="Términos de pago"
              rows={2}
            />
          </div>
        </div>
        <div className="text-right space-y-1">
          <div>Subtotal: <b>{subtotal.toFixed(2)} €</b></div>
          <div>IVA: <b>{totalIVA.toFixed(2)} €</b></div>
          <div>Total: <b>{total.toFixed(2)} €</b></div>
        </div>
        <div className="flex justify-end gap-2">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar factura y descargar PDF'}
          </button>
        </div>
      </form>

      {/* Previsualización en tiempo real */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Previsualización</h2>
        <div ref={previewRef} className="bg-white p-8 rounded shadow border max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-bold text-lg">Factura</div>
              <div className="text-sm text-gray-500">Fecha: {fecha}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{clientes.find(c => c.id === clienteId)?.name || "Cliente"}</div>
            </div>
          </div>
          <table className="w-full mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-2 py-1">Descripción</th>
                <th className="text-right px-2 py-1">Cantidad</th>
                <th className="text-right px-2 py-1">Precio</th>
                <th className="text-right px-2 py-1">IVA (%)</th>
                <th className="text-right px-2 py-1">Importe</th>
              </tr>
            </thead>
            <tbody>
              {conceptos.map((c, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-1 border-b">{c.descripcion}</td>
                  <td className="px-2 py-1 border-b text-right">{c.cantidad}</td>
                  <td className="px-2 py-1 border-b text-right">{c.precio.toFixed(2)} €</td>
                  <td className="px-2 py-1 border-b text-right">{c.iva}</td>
                  <td className="px-2 py-1 border-b text-right">{(c.cantidad * c.precio * (1 + c.iva / 100)).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mb-2">
            <div className="w-64">
              <div className="flex justify-between"><span>Subtotal:</span><span>{subtotal.toFixed(2)} €</span></div>
              <div className="flex justify-between"><span>IVA:</span><span>{totalIVA.toFixed(2)} €</span></div>
              <div className="flex justify-between font-bold"><span>Total:</span><span>{total.toFixed(2)} €</span></div>
            </div>
          </div>
          {notas && <div className="mt-4"><b>Notas:</b> {notas}</div>}
          {terminos && <div className="mt-2 text-sm text-gray-600"><b>Términos de pago:</b> {terminos}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice; 