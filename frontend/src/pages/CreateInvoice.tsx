import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoicesApi, clientsApi, settingsApi } from '../services/api';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Plus, Trash2, Save, Download, ArrowLeft } from 'lucide-react';
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
                <Text style={styles.tableCellRight}>{formatCurrency(itemTotal)}</Text>
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
              <Text style={styles.totalAmount}>{formatCurrency(subtotal + totalIVA)}</Text>
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

        <Text style={styles.footer}>Teblo - Facturación profesional</Text>
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
      const newInvoice = await invoicesApi.create({
        clientId: clienteId,
        date: fecha,
        dueDate: undefined,
        items: conceptos.map(c => ({
          description: c.descripcion,
          quantity: c.cantidad,
          price: c.precio,
          vatRate: c.iva
        })),
        notes: notas,
        terms: terminos
      });

      const settingsData = await settingsApi.get();
      setSettings(settingsData);
      setCreatedInvoice(newInvoice);
      setShowPDFDownload(true);
      
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
    navigate('/invoices');
  };

  // Modal de descarga de PDF
  if (showPDFDownload && createdInvoice && settings) {
    const safeClientName = createdInvoice.client.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `factura-${createdInvoice.number}-${safeClientName}.pdf`;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Factura creada!</h3>
            <p className="text-gray-600">
              La factura se ha guardado correctamente. Ahora puedes descargar el PDF.
            </p>
          </div>
          
          <div className="space-y-3">
            <PDFDownloadLink
              document={<InvoicePDF invoice={createdInvoice} settings={settings} />}
              fileName={fileName}
              className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              {({ loading }) => (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  {loading ? 'Generando PDF...' : 'Descargar PDF'}
                </>
              )}
            </PDFDownloadLink>
            
            <button
              onClick={handleClosePDF}
              className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Ir a Facturas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/invoices')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Crear Factura</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Conceptos */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Conceptos</h2>
              <button
                type="button"
                onClick={addConcepto}
                className="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir concepto
              </button>
            </div>

            <div className="space-y-4">
              {conceptos.map((c, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Descripción *</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Descripción del producto o servicio"
                        value={c.descripcion}
                        onChange={e => handleConceptoChange(idx, "descripcion", e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad *</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min={1}
                        value={c.cantidad}
                        onChange={e => handleConceptoChange(idx, "cantidad", Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Precio *</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min={0}
                        step={0.01}
                        value={c.precio}
                        onChange={e => handleConceptoChange(idx, "precio", Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">IVA %</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min={0}
                        max={21}
                        value={c.iva}
                        onChange={e => handleConceptoChange(idx, "iva", Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {conceptos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeConcepto(idx)}
                          className="w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Subtotal: {(c.cantidad * c.precio).toFixed(2)} € | 
                    IVA: {((c.cantidad * c.precio * c.iva) / 100).toFixed(2)} € | 
                    Total: {(c.cantidad * c.precio * (1 + c.iva / 100)).toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas y términos */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Notas u observaciones"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Términos de pago</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={terminos}
                  onChange={e => setTerminos(e.target.value)}
                  placeholder="Términos de pago"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Subtotal: <span className="font-medium">{subtotal.toFixed(2)} €</span></div>
                <div className="text-sm text-gray-600">IVA: <span className="font-medium">{totalIVA.toFixed(2)} €</span></div>
                <div className="text-lg font-bold text-gray-900">Total: {total.toFixed(2)} €</div>
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="mr-2 h-5 w-5" />
                {saving ? 'Guardando...' : 'Guardar Factura'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice; 