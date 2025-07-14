import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { settingsApi, invoicesApi, clientsApi } from '../services/api';
import NativePDFGenerator, { InvoicePDF } from '../components/NativePDFGenerator';
import NativeMultiPDFGenerator from '../components/NativeMultiPDFGenerator';
import { PDFViewer } from '@react-pdf/renderer';
import type { Settings, Invoice } from '../types';

interface InvoiceWithExtras extends Invoice {
  amountPaid?: number; // Added for editing
}

interface ClientOption {
  id: string;
  name: string;
}

const Invoices: React.FC = () => {
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
  // Estado para controlar la exportación múltiple
  const [exportMultiple, setExportMultiple] = useState(false);
  const [invoicesToExport, setInvoicesToExport] = useState<InvoiceWithExtras[]>([]);
  // Nuevo estado para mostrar la previsualización en la página
  const [showPreview, setShowPreview] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.getAll();
      setInvoices(Array.isArray(data) ? data as InvoiceWithExtras[] : []);
      setError(null);
    } catch (err: any) {
      setError("Error al cargar las facturas");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
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

  // Eliminar handleSubmit, form, formError, setForm, initialForm, showModal y toda la lógica asociada

  // const handleEdit = (invoice: InvoiceWithExtras) => {
  //   setEditingInvoice(invoice);
  //   // Eliminar referencias a form, setForm, setFormError, initialForm, formError
  // };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Eliminar referencias a form, setForm, setFormError, initialForm, formError
    if (!editingInvoice) {
      // setFormError("Cliente y total son obligatorios"); // Originalmente estaba aquí
      return;
    }

    try {
      setSaving(true);
      // setFormError(null); // Originalmente estaba aquí
      await invoicesApi.update(editingInvoice.id, {
        date: editingInvoice.date,
        status: editingInvoice.status,
        items: editingInvoice.items || [],
        notes: editingInvoice.notes
      });
      setShowEditModal(false);
      setEditingInvoice(null);
      // setForm(initialForm); // Originalmente estaba aquí
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchInvoices();
    } catch (err: any) {
      // setFormError("Error al actualizar la factura"); // Originalmente estaba aquí
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


  // Nueva función para mostrar la previsualización en la página
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

  const openPaidModal = (invoice: InvoiceWithExtras) => {
    setPaidInvoice(invoice);
    setPaidAmount(invoice.total.toString());
    setPaidDate(new Date().toISOString().slice(0, 10));
    setPaidType('PAID');
    setShowPaidModal(true);
  };
  
  const handleSavePaid = async () => {
    if (!paidInvoice) return;
    const amountPaid = parseFloat(paidAmount.replace(',', '.'));
    if (isNaN(amountPaid) || amountPaid <= 0) {
      alert('Importe no válido');
      return;
    }
    try {
      // Registrar el pago en el historial
      await fetch(`https://api.teblo.app/api/invoices/${paidInvoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountPaid,
          date: paidDate,
          type: paidType,
          note: `Pago registrado - ${paidType === 'PAID' ? 'Total' : 'Parcial'}`
        })
      });
      
      // Actualizar el estado de la factura
      const newStatus = paidType === 'PAID' ? 'PAID' : 'PENDING';
      await invoicesApi.update(paidInvoice.id, {
        date: paidInvoice.date,
        status: newStatus,
        items: paidInvoice.items || [],
        notes: paidInvoice.notes
      });
      
      setShowPaidModal(false);
      fetchInvoices();
      alert('Pago registrado correctamente');
    } catch (err) {
      alert('Error al registrar el pago');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (searchDate) params.append('date', searchDate);
      if (searchTotal) params.append('total', searchTotal);
      if (searchStatus) params.append('status', searchStatus);
      
      const response = await fetch(`https://api.teblo.app/api/invoices/search?${params.toString()}`);
      const searchResults = await response.json();
      setInvoices(Array.isArray(searchResults) ? searchResults as InvoiceWithExtras[] : []);
    } catch (err) {
      setError('Error buscando facturas');
    }
  };

  if (loading) return <div className="p-4">Cargando facturas...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Facturas</h1>
        <div className="flex items-center">
          <button
            onClick={() => navigate("/invoices/new")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Nueva Factura
          </button>
          {selectedIds.length > 0 && settings && (
            <button
              onClick={() => {
                setInvoicesToExport(invoices.filter(inv => selectedIds.includes(inv.id)));
                setExportMultiple(true);
              }}
              className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Descargar seleccionadas
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          Operación completada con éxito
        </div>
      )}

      {/* Barra de búsqueda avanzada */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center mb-6">
        <div>
          <label className="block text-sm font-medium">Cliente o número</label>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-4 py-2 w-64"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input
            type="date"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
            className="border rounded px-4 py-2 w-48"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Total</label>
          <input
            type="text"
            placeholder="€"
            value={searchTotal}
            onChange={e => setSearchTotal(e.target.value)}
            className="border rounded px-4 py-2 w-32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            value={searchStatus}
            onChange={e => setSearchStatus(e.target.value)}
            className="border rounded px-4 py-2 w-40"
          >
            <option value="">Todos</option>
            <option value="PAID">Pagada</option>
            <option value="PENDING">Pendiente</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded text-lg">Buscar</button>
        <button
          type="button"
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded text-lg"
          onClick={() => {
            setSearch('');
            setSearchDate('');
            setSearchTotal('');
            setSearchStatus('');
            fetchInvoices();
          }}
        >
          Limpiar
        </button>
      </form>

      {/* Botón de descarga múltiple */}
      {selectedIds.length > 0 && (
        <div className="mb-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              const selected = invoices.filter(inv => selectedIds.includes(inv.id));
              setInvoicesToExport(selected);
              setExportMultiple(true);
            }}
          >
            Descargar seleccionadas
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <p className="text-sm text-gray-600 mb-2">Haz clic en cualquier factura para ver la previsualización y generar el PDF</p>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">
                <input type="checkbox" checked={selectedIds.length === invoices.length && invoices.length > 0} onChange={e => setSelectedIds(e.target.checked ? invoices.map(i => i.id) : [])} />
              </th>
              <th className="border px-4 py-2">Número</th>
              <th className="border px-4 py-2">Cliente</th>
              <th className="border px-4 py-2">Fecha</th>
              <th className="border px-4 py-2">Estado</th>
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleShowPreview(invoice)}>
                <td className="border px-4 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(invoice.id)}
                    onChange={e => {
                      e.stopPropagation();
                      setSelectedIds(ids => e.target.checked ? [...ids, invoice.id] : ids.filter(id => id !== invoice.id));
                    }}
                  />
                </td>
                <td className="border px-4 py-2">{invoice.number}</td>
                <td className="border px-4 py-2">{invoice.client?.name || "Sin cliente"}</td>
                <td className="border px-4 py-2">{new Date(invoice.date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    invoice.status === "PAID" ? "bg-green-100 text-green-800" :
                    invoice.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="border px-4 py-2">€{invoice.total.toFixed(2)}</td>
                <td className="border px-4 py-2 flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleDelete(invoice.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Eliminar</button>
                  <button onClick={() => openPaidModal(invoice)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Marcar pagada</button>
                  {invoice.status !== 'CANCELLED' && (
                    <button onClick={() => handleCancel(invoice)} className="bg-gray-400 text-white px-2 py-1 rounded text-xs">Anular</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Previsualización en la página principal */}
      {showPreview && selectedInvoice && settings && selectedInvoice.client && selectedInvoice.items && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Previsualización de Factura</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cerrar previsualización
            </button>
          </div>
          {/* PDFViewer para previsualización */}
          <div className="mb-4" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <PDFViewer width="100%" height={600} style={{ border: 'none', width: '100%' }}>
              <InvoicePDF invoice={selectedInvoice} settings={settings} />
            </PDFViewer>
          </div>
          {/* Botón de descarga */}
          <NativePDFGenerator
            invoice={selectedInvoice}
            settings={settings}
          />
        </div>
      )}

      {/* Eliminar el modal de nueva factura aquí */}
      {/* Modal para crear factura */}
      {/* El modal de nueva factura y su lógica han sido eliminados */}

      {/* Modal para editar factura */}
      {showEditModal && editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Editar Factura</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  value={editingInvoice.date.slice(0, 10)}
                  onChange={(e) => setEditingInvoice({...editingInvoice, date: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={editingInvoice.status}
                  onChange={(e) => setEditingInvoice({...editingInvoice, status: e.target.value as 'PENDING' | 'PAID' | 'CANCELLED'})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="PAID">Pagada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
              {editingInvoice.status === 'PAID' && (
                <div className="mb-4">
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
              <div className="mb-4">
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={editingInvoice.notes || ""}
                  onChange={(e) => setEditingInvoice({...editingInvoice, notes: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              {/* Eliminar referencias a form, setForm, setFormError, initialForm, formError */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Actualizar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingInvoice(null);
                    // setForm(initialForm); // Originalmente estaba aquí
                    // setFormError(null); // Originalmente estaba aquí
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Registrar pago</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Importe pagado</label>
              <input
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fecha de pago</label>
              <input
                type="date"
                value={paidDate}
                onChange={e => setPaidDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
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
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPaidModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
              <button onClick={handleSavePaid} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para exportar múltiples facturas */}
      {exportMultiple && settings && (
        <NativeMultiPDFGenerator
          invoices={invoicesToExport}
          settings={settings}
          onClose={() => setExportMultiple(false)}
        />
      )}
    </div>
  );
};

export default Invoices; 