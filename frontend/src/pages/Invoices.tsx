import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { settingsApi, invoicesApi, clientsApi } from '../services/api';
import NativePDFGenerator, { InvoicePDF } from '../components/NativePDFGenerator';
import NativeMultiPDFGenerator from '../components/NativeMultiPDFGenerator';
import { PDFViewer } from '@react-pdf/renderer';
import { Search, Filter, Download, Eye, Trash2, CheckCircle, XCircle, X, History, Plus } from 'lucide-react';
import type { Settings, Invoice, Payment } from '../types';

interface InvoiceWithExtras extends Invoice {
  amountPaid?: number;
}

interface ClientOption {
  id: string;
  name: string;
}

const Invoices: React.FC = () => {
  // 🔄 ÚLTIMA ACTUALIZACIÓN: 25/07/2025 - Botones diferenciados por color
  const [invoices, setInvoices] = useState<InvoiceWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithExtras | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithExtras | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paidInvoice, setPaidInvoice] = useState<InvoiceWithExtras | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [paidType, setPaidType] = useState<'PAID' | 'PARTIALLY_PAID'>('PAID');
  const [search, setSearch] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTotal, setSearchTotal] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [exportMultiple, setExportMultiple] = useState(false);
  const [invoicesToExport, setInvoicesToExport] = useState<InvoiceWithExtras[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // Payment history states
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistoryInvoice, setPaymentHistoryInvoice] = useState<InvoiceWithExtras | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'PARTIALLY_PAID' as 'PAID' | 'PARTIALLY_PAID',
    note: ''
  });
  const [invoicePayments, setInvoicePayments] = useState<{[key: string]: Payment[]}>({});

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.getAll();
      const invoicesData = Array.isArray(data) ? data as InvoiceWithExtras[] : [];
      setInvoices(invoicesData);
      setError(null);
      
      // Cargar pagos para todas las facturas
      await loadPaymentsForInvoices(invoicesData);
    } catch (err: any) {
      setError("Error al cargar las facturas");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentsForInvoices = async (invoices: InvoiceWithExtras[]) => {
    const paymentsMap: {[key: string]: Payment[]} = {};
    
    for (const invoice of invoices) {
      try {
        const paymentsData = await invoicesApi.getPayments(invoice.id);
        paymentsMap[invoice.id] = paymentsData;
      } catch (err) {
        console.error(`Error loading payments for invoice ${invoice.id}:`, err);
        paymentsMap[invoice.id] = [];
      }
    }
    
    setInvoicePayments(paymentsMap);
  };

  const fetchClients = async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setClients([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    try {
      setSaving(true);
      await invoicesApi.update(editingInvoice.id, {
        date: editingInvoice.date,
        status: editingInvoice.status,
        items: editingInvoice.items || [],
        notes: editingInvoice.notes
      });
      setShowEditModal(false);
      setEditingInvoice(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchInvoices();
    } catch (err: any) {
      setError("Error al actualizar la factura");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta factura?")) return;

    try {
      await invoicesApi.delete(id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchInvoices();
    } catch (err: any) {
      setError("Error al eliminar la factura");
    }
  };

  const handleCancel = async (invoice: InvoiceWithExtras) => {
    if (!confirm('¿Seguro que quieres anular esta factura?')) return;
    try {
      await invoicesApi.update(invoice.id, {
        ...invoice,
        status: 'CANCELLED',
      });
      fetchInvoices();
    } catch (err) {
      alert('Error al anular la factura');
    }
  };

  const handleShowPreview = async (invoice: InvoiceWithExtras) => {
    try {
      const invoiceData = await invoicesApi.getById(invoice.id);
      setSelectedInvoice(invoiceData as InvoiceWithExtras);
      const settingsRes = await settingsApi.get();
      setSettings(settingsRes);
      setShowPreview(true);
    } catch (err) {
      setError("Error al cargar los detalles de la factura");
    }
  };

  const openPaidModal = async (invoice: InvoiceWithExtras) => {
    setPaidInvoice(invoice);
    setPaidAmount(invoice.total.toString());
    setPaidDate(new Date().toISOString().slice(0, 10));
    setPaidType('PAID');
    setShowPaidModal(true);
    
    // Cargar pagos existentes
    try {
      const paymentsData = await invoicesApi.getPayments(invoice.id);
      setPayments(paymentsData);
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      setPayments([]);
    }
  };
  
  const handleSavePaid = async () => {
    if (!paidInvoice) return;
    const amountPaid = parseFloat(paidAmount.replace(',', '.'));
    if (isNaN(amountPaid) || amountPaid <= 0) {
      setError('Importe no válido');
      return;
    }
    try {
      setSaving(true);
      
      // Registrar el pago usando la API
      await invoicesApi.addPayment(paidInvoice.id, {
        amount: amountPaid,
        date: paidDate,
        type: paidType,
        note: `Pago registrado - ${paidType === 'PAID' ? 'Total' : 'Parcial'}`
      });
      
      // Recargar los pagos para actualizar la vista
      const paymentsData = await invoicesApi.getPayments(paidInvoice.id);
      setPayments(paymentsData);
      
      // Actualizar el estado de la factura si es necesario
      const totalPaid = calculateTotalPaid(paymentsData);
      
      let newStatus = paidInvoice.status;
      if (totalPaid >= paidInvoice.total) {
        newStatus = 'PAID';
      } else if (totalPaid > 0) {
        newStatus = 'PENDING';
      }
      
      // Solo actualizar si el estado cambió
      if (newStatus !== paidInvoice.status) {
        await invoicesApi.update(paidInvoice.id, {
          date: paidInvoice.date,
          status: newStatus,
          items: paidInvoice.items || [],
          notes: paidInvoice.notes
        });
      }
      
      // Recargar facturas para actualizar la lista
      await fetchInvoices();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Resetear el formulario
      setPaidAmount('');
      setPaidDate(new Date().toISOString().slice(0, 10));
      setPaidType('PAID');
      
    } catch (err) {
      setError('Error al registrar el pago');
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (searchDate) params.append('date', searchDate);
      if (searchTotal) params.append('total', searchTotal);
      if (searchStatus) params.append('status', searchStatus);
      
      const response = await fetch(`https://api.teblo.app/api/invoices?${params.toString()}`);
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al buscar facturas");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PRO_FORMA': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pagada';
      case 'CANCELLED': return 'Cancelada';
      case 'PRO_FORMA': return 'Pro-forma';
      default: return 'Pendiente';
    }
  };

  const handleConvertToDefinitive = async (invoice: InvoiceWithExtras) => {
    if (!confirm('¿Seguro que quieres convertir esta factura pro-forma en definitiva?')) return;
    try {
      await invoicesApi.update(invoice.id, {
        date: invoice.date,
        status: 'PENDING',
        items: invoice.items || [],
        notes: invoice.notes
      });
      fetchInvoices();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al convertir la factura");
    }
  };

  const handleShowPaymentHistory = async (invoice: InvoiceWithExtras) => {
    setPaymentHistoryInvoice(invoice);
    setLoadingPayments(true);
    try {
      const paymentsData = await invoicesApi.getPayments(invoice.id);
      setPayments(paymentsData);
      setShowPaymentHistory(true);
    } catch (err) {
      setError("Error al cargar el historial de pagos");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePaymentAction = async (invoice: InvoiceWithExtras) => {
    // Si la factura está pagada, mostrar historial
    if (invoice.status === 'PAID') {
      await handleShowPaymentHistory(invoice);
    } else {
      // Si está pendiente, abrir modal de pago
      openPaidModal(invoice);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentHistoryInvoice || !newPayment.amount) return;
    
    try {
      setSaving(true);
      await invoicesApi.addPayment(paymentHistoryInvoice.id, {
        amount: parseFloat(newPayment.amount),
        date: newPayment.date,
        type: newPayment.type,
        note: newPayment.note
      });
      
      // Reload payments
      const paymentsData = await invoicesApi.getPayments(paymentHistoryInvoice.id);
      setPayments(paymentsData);
      
      // Reset form
      setNewPayment({
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'PARTIALLY_PAID',
        note: ''
      });
      setShowAddPayment(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reload invoices to update totals
      fetchInvoices();
    } catch (err) {
      setError("Error al añadir el pago");
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalPaid = (payments: Payment[]) => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculatePendingAmount = (invoice: InvoiceWithExtras, payments: Payment[]) => {
    const totalPaid = calculateTotalPaid(payments);
    return Math.max(0, invoice.total - totalPaid);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando facturas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600">Gestiona todas tus facturas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={async () => {
                const selected = invoices.filter(inv => selectedIds.includes(inv.id));
                setInvoicesToExport(selected);
                try {
                  const settingsData = await settingsApi.get();
                  setSettings(settingsData);
                  setExportMultiple(true);
                } catch (err) {
                  setError("Error al cargar la configuración para la descarga");
                }
              }}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de búsqueda</h3>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente o número</label>
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <input
                type="text"
                placeholder="€"
                value={searchTotal}
                onChange={e => setSearchTotal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={searchStatus}
                onChange={e => setSearchStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="PAID">Pagada</option>
                <option value="PENDING">Pendiente</option>
                <option value="PRO_FORMA">Pro-forma</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
              <button 
                type="submit" 
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSearchDate('');
                  setSearchTotal('');
                  setSearchStatus('');
                  fetchInvoices();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Operación completada exitosamente
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Lista de facturas */}
      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-gray-500 text-lg mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl font-medium text-gray-900 mb-2">Vaya, parece que todavía no tienes facturas</p>
            <p className="text-gray-600">Comienza creando tu primera factura para gestionar tus ventas.</p>
          </div>
          <button
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            onClick={() => navigate("/invoices/new")}
          >
            + Crear mi primera factura
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Haz clic en cualquier factura para ver la previsualización y generar el PDF</p>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === invoices.length && invoices.length > 0} 
                      onChange={e => setSelectedIds(e.target.checked ? invoices.map(i => i.id) : [])} 
                    />
                  </th>
                  <th className="border px-4 py-3 text-left">Número</th>
                  <th className="border px-4 py-3 text-left">Cliente</th>
                  <th className="border px-4 py-3 text-left">Fecha</th>
                  <th className="border px-4 py-3 text-left">Estado</th>
                  <th className="border px-4 py-3 text-left">Total</th>
                  <th className="border px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleShowPreview(invoice)}>
                    <td className="border px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(invoice.id)}
                        onChange={e => {
                          e.stopPropagation();
                          setSelectedIds(ids => e.target.checked ? [...ids, invoice.id] : ids.filter(id => id !== invoice.id));
                        }}
                      />
                    </td>
                    <td className="border px-4 py-3 font-medium">{invoice.number}</td>
                    <td className="border px-4 py-3">{invoice.client?.name || "Sin cliente"}</td>
                    <td className="border px-4 py-3">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="border px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="border px-4 py-3 font-medium">
                      <div>
                        <div className="font-medium">€{invoice.total.toFixed(2)}</div>
                        {(() => {
                          const invoicePaymentsList = invoicePayments[invoice.id] || [];
                          const totalPaid = calculateTotalPaid(invoicePaymentsList);
                          const pendingAmount = calculatePendingAmount(invoice, invoicePaymentsList);
                          
                          if (invoice.status === 'PENDING' && totalPaid > 0) {
                            return (
                              <div className="text-xs">
                                <div className="text-green-600">Pagado: €{totalPaid.toFixed(2)}</div>
                                <div className="text-red-600">Pendiente: €{pendingAmount.toFixed(2)}</div>
                              </div>
                            );
                          } else if (invoice.status === 'PENDING') {
                            return (
                              <div className="text-xs text-gray-600">
                                Pendiente: €{invoice.total.toFixed(2)}
                              </div>
                            );
                          } else if (invoice.status === 'PAID') {
                            return (
                              <div className="text-xs text-green-600">
                                Pagado: €{invoice.total.toFixed(2)}
                              </div>
                            );
                          } else if (invoice.status === 'PRO_FORMA') {
                            return (
                              <div className="text-xs text-blue-600">
                                Pro-forma
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="border px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(invoice.id)} 
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar factura"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePaymentAction(invoice)} 
                          className="text-primary-600 hover:text-primary-700"
                          title={invoice.status === 'PAID' ? 'Ver historial de pagos' : 'Marcar como pagada'}
                        >
                          {invoice.status === 'PAID' ? <History className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        {invoice.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => handleCancel(invoice)} 
                            className="text-gray-600 hover:text-gray-700"
                            title="Anular factura"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {invoice.status === 'PRO_FORMA' && (
                          <button 
                            onClick={() => handleConvertToDefinitive(invoice)} 
                            className="text-purple-600 hover:text-purple-700"
                            title="Convertir a factura definitiva"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleShowPreview(invoice)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(invoice.id)}
                      onChange={e => {
                        e.stopPropagation();
                        setSelectedIds(ids => e.target.checked ? [...ids, invoice.id] : ids.filter(id => id !== invoice.id));
                      }}
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{invoice.number}</h3>
                      <p className="text-sm text-gray-600">{invoice.client?.name || "Sin cliente"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">€{invoice.total.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                    {(() => {
                      const invoicePaymentsList = invoicePayments[invoice.id] || [];
                      const totalPaid = calculateTotalPaid(invoicePaymentsList);
                      const pendingAmount = calculatePendingAmount(invoice, invoicePaymentsList);
                      
                      if (invoice.status === 'PENDING' && totalPaid > 0) {
                        return (
                          <div className="text-xs mt-1">
                            <p className="text-green-600">Pagado: €{totalPaid.toFixed(2)}</p>
                            <p className="text-red-600">Pendiente: €{pendingAmount.toFixed(2)}</p>
                          </div>
                        );
                      } else if (invoice.status === 'PENDING') {
                        return (
                          <p className="text-xs text-gray-600 mt-1">Pendiente: €{invoice.total.toFixed(2)}</p>
                        );
                      } else if (invoice.status === 'PAID') {
                        return (
                          <p className="text-xs text-green-600 mt-1">Pagado: €{invoice.total.toFixed(2)}</p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{new Date(invoice.date).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleShowPreview(invoice)}
                    className="flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                    title="Ver previsualización de la factura"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Ver
                  </button>
                  <button 
                    onClick={() => handlePaymentAction(invoice)}
                    className="flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                    title={invoice.status === 'PAID' ? 'Ver historial de pagos' : 'Marcar como pagada'}
                  >
                    {invoice.status === 'PAID' ? <History className="mr-1 h-4 w-4" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                    {invoice.status === 'PAID' ? 'Pagos' : 'Pagar'}
                  </button>
                  <button 
                    onClick={() => handleDelete(invoice.id)}
                    className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    title="Eliminar factura"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Eliminar
                  </button>
                  {invoice.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => handleCancel(invoice)}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                      title="Anular factura"
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Anular
                    </button>
                  )}
                  {invoice.status === 'PRO_FORMA' && (
                    <button 
                      onClick={() => handleConvertToDefinitive(invoice)}
                      className="flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
                      title="Convertir a factura definitiva"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      Convertir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previsualización */}
      {showPreview && selectedInvoice && settings && selectedInvoice.client && selectedInvoice.items && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Previsualización de Factura</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mb-4" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <PDFViewer width="100%" height={600} style={{ border: 'none', width: '100%' }}>
              <InvoicePDF invoice={selectedInvoice} settings={settings} />
            </PDFViewer>
          </div>
          <NativePDFGenerator
            invoice={selectedInvoice}
            settings={settings}
          />
        </div>
      )}

      {/* Modal para editar factura */}
      {showEditModal && editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Factura</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <select
                  value={editingInvoice.client?.id || ""}
                  onChange={(e) => setEditingInvoice({...editingInvoice, client: { id: e.target.value, name: editingInvoice?.client?.name || "" } as any})}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  value={editingInvoice.date.slice(0, 10)}
                  onChange={(e) => setEditingInvoice({...editingInvoice, date: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={editingInvoice.status}
                  onChange={(e) => setEditingInvoice({...editingInvoice, status: e.target.value as 'PENDING' | 'PAID' | 'CANCELLED' | 'PRO_FORMA'})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="PAID">Pagada</option>
                  <option value="PRO_FORMA">Pro-forma</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
              {editingInvoice.status === 'PAID' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad pagada</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.amountPaid || editingInvoice.total}
                    onChange={e => setEditingInvoice({...editingInvoice, amountPaid: parseFloat(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Total *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingInvoice.total.toString()}
                  onChange={(e) => setEditingInvoice({...editingInvoice, total: parseFloat(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={editingInvoice.notes || ""}
                  onChange={(e) => setEditingInvoice({...editingInvoice, notes: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Actualizar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingInvoice(null);
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para pago */}
      {showPaidModal && paidInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Gestionar Pagos - {paidInvoice.number}</h2>
              <button
                onClick={() => setShowPaidModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Información de la factura */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Factura:</span>
                  <span className="ml-2 font-medium">€{paidInvoice.total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(paidInvoice.status)}`}>
                    {getStatusText(paidInvoice.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Historial de pagos existentes */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagos Registrados</h3>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {payments.length === 0 ? (
                  <p className="text-gray-600 text-sm">No hay pagos registrados</p>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900">€{payment.amount.toFixed(2)}</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            payment.type === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {payment.type === 'PAID' ? 'Total' : 'Parcial'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(payment.date).toLocaleDateString()}
                        </span>
                      </div>
                      {payment.note && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{payment.note}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Formulario para nuevo pago */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Añadir Nuevo Pago</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Importe pagado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de pago</label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={e => setPaidDate(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de pago</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-1">
                      <input type="radio" checked={paidType === 'PAID'} onChange={() => setPaidType('PAID')} />
                      Total
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" checked={paidType === 'PARTIALLY_PAID'} onChange={() => setPaidType('PARTIALLY_PAID')} />
                      Parcial
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowPaidModal(false)} 
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSavePaid} 
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Guardar Pago
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para exportar múltiples facturas */}
      {exportMultiple && settings && invoicesToExport.length > 0 && (
        <NativeMultiPDFGenerator
          invoices={invoicesToExport}
          settings={settings}
          onClose={() => setExportMultiple(false)}
        />
      )}

             {/* Modal para historial de pagos */}
       {showPaymentHistory && paymentHistoryInvoice && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-6 w-full max-w-lg">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Historial de Pagos</h2>
               <button
                 onClick={() => setShowPaymentHistory(false)}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <X className="h-6 w-6" />
               </button>
             </div>
             
             <div className="mb-4 p-4 bg-gray-50 rounded-lg">
               <h3 className="font-semibold text-gray-900 mb-2">Factura {paymentHistoryInvoice.number}</h3>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-gray-600">Total Factura:</span>
                   <span className="ml-2 font-medium">€{paymentHistoryInvoice.total.toFixed(2)}</span>
                 </div>
                 <div>
                   <span className="text-gray-600">Total Pagado:</span>
                   <span className="ml-2 font-medium text-green-600">€{calculateTotalPaid(payments).toFixed(2)}</span>
                 </div>
                 <div>
                   <span className="text-gray-600">Pendiente:</span>
                   <span className="ml-2 font-medium text-red-600">€{calculatePendingAmount(paymentHistoryInvoice, payments).toFixed(2)}</span>
                 </div>
                 <div>
                   <span className="text-gray-600">Estado:</span>
                   <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(paymentHistoryInvoice.status)}`}>
                     {getStatusText(paymentHistoryInvoice.status)}
                   </span>
                 </div>
               </div>
             </div>

             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Pagos Registrados</h3>
               <button
                 onClick={() => setShowAddPayment(true)}
                 className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
               >
                 <Plus className="mr-2 h-4 w-4" />
                 Añadir Pago
               </button>
             </div>
             
             {loadingPayments ? (
               <div className="text-center py-8">Cargando pagos...</div>
             ) : payments.length === 0 ? (
               <div className="text-center py-8 text-gray-600">
                 <p>No hay pagos registrados para esta factura.</p>
                 <p className="text-sm mt-2">Haz clic en "Añadir Pago" para registrar el primer pago.</p>
               </div>
             ) : (
               <div className="space-y-3 max-h-64 overflow-y-auto">
                 {payments.map((payment) => (
                   <div key={payment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="font-semibold text-gray-900">€{payment.amount.toFixed(2)}</span>
                           <span className={`px-2 py-1 rounded text-xs font-medium ${
                             payment.type === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                           }`}>
                             {payment.type === 'PAID' ? 'Total' : 'Parcial'}
                           </span>
                         </div>
                         <p className="text-sm text-gray-600 mb-1">
                           {new Date(payment.date).toLocaleDateString('es-ES', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </p>
                         {payment.note && (
                           <p className="text-sm text-gray-600 italic">"{payment.note}"</p>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
       )}

      {/* Modal para añadir pago */}
      {showAddPayment && paymentHistoryInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Añadir Pago a {paymentHistoryInvoice.number}</h2>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Importe</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={e => setNewPayment({...newPayment, date: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de pago</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={newPayment.type === 'PAID'} onChange={() => setNewPayment({...newPayment, type: 'PAID'})} />
                    Total
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={newPayment.type === 'PARTIALLY_PAID'} onChange={() => setNewPayment({...newPayment, type: 'PARTIALLY_PAID'})} />
                    Parcial
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={newPayment.note}
                  onChange={e => setNewPayment({...newPayment, note: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 