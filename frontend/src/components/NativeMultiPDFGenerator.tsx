import React from 'react';
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

// Estilos para el PDF
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
  tableCellBold: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
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
  },
  pageBreak: {
    pageBreakAfter: 'always'
  }
});

// Componente para una factura individual
const InvoicePage = ({ invoice, settings, isLast }: { invoice: Invoice; settings: Settings; isLast: boolean }) => {
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
    <Page size="A4" style={[styles.page, !isLast ? styles.pageBreak : {}]}>
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
  );
};

// Componente para el documento completo con múltiples facturas
const MultiInvoicePDF = ({ invoices, settings }: { invoices: Invoice[]; settings: Settings }) => {
  return (
    <Document>
      {invoices.map((invoice, index) => (
        <InvoicePage
          key={invoice.id}
          invoice={invoice}
          settings={settings}
          isLast={index === invoices.length - 1}
        />
      ))}
    </Document>
  );
};

// Componente principal
interface NativeMultiPDFGeneratorProps {
  invoices: Invoice[];
  settings: Settings;
  onClose: () => void;
}

const NativeMultiPDFGenerator: React.FC<NativeMultiPDFGeneratorProps> = ({ invoices, settings, onClose }) => {
  const fileName = `facturas-multiples-${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Generar PDF con múltiples facturas</h3>
        <p className="text-gray-600 mb-6">
          Se generará un PDF con {invoices.length} factura{invoices.length > 1 ? 's' : ''}.
        </p>
        
        <div className="flex space-x-3">
          <PDFDownloadLink
            document={<MultiInvoicePDF invoices={invoices} settings={settings} />}
            fileName={fileName}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-center"
          >
            {({ loading }) =>
              loading ? 'Generando PDF...' : 'Descargar PDF'
            }
          </PDFDownloadLink>
          
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NativeMultiPDFGenerator; 