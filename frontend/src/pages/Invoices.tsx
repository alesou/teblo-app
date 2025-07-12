import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InvoicePreview from '../components/InvoicePreview';
import { settingsApi, pdfApi } from '../services/api';
import type { Settings } from '../types';

interface Invoice {
  id: string;
  number: string;
  date: string;
  status: string;
  total: number;
  notes?: string;
  client?: { id: string; name: string };
  items?: InvoiceItem[];
  amountPaid?: number; // Added for editing
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  vatRate: number;
}

interface ClientOption {
  id: string;
  name: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paidInvoice, setPaidInvoice] = useState<Invoice | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [paidType, setPaidType] = useState<'PAID' | 'PARTIALLY_PAID'>('PAID');
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTotal, setSearchTotal] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/invoices");
      setInvoices(res.data);
      setError(null);
    } catch (err: any) {
      setError("Error al cargar las facturas");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get("/api/clients");
      setClients(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  // Eliminar handleSubmit, form, formError, setForm, initialForm, showModal y toda la lógica asociada

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    // Eliminar referencias a form, setForm, setFormError, initialForm, formError
  };

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
      await axios.put(`/api/invoices/${editingInvoice.id}`, {
        // ...form, // Originalmente estaba aquí
        total: parseFloat(editingInvoice.total.toString()), // Assuming total is part of editingInvoice
        amountPaid: editingInvoice.amountPaid // Add amountPaid to the update payload
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
      await axios.delete(`/api/invoices/${id}`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchInvoices();
    } catch (err: any) {
      setError("Error al eliminar la factura");
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    const defaultAmount = invoice.total.toFixed(2);
    const input = prompt('Introduce el importe pagado:', defaultAmount);
    if (input === null) return; // Cancelado
    const amountPaid = parseFloat(input.replace(',', '.'));
    if (isNaN(amountPaid) || amountPaid <= 0) {
      alert('Importe no válido');
      return;
    }
    try {
      await axios.put(`/api/invoices/${invoice.id}`, {
        ...invoice,
        status: 'PAID',
        amountPaid,
        // Aseguramos que items y client no se pierdan
        items: invoice.items || [],
        client: invoice.client || undefined
      });
      fetchInvoices();
      alert('Factura marcada como pagada');
    } catch (err) {
      alert('Error al marcar como pagada');
    }
  };

  // Cargar historial de pagos al abrir el modal de detalles
  const handleRowClick = async (invoice: Invoice) => {
    try {
      const res = await axios.get(`/api/invoices/${invoice.id}`);
      setSelectedInvoice(res.data);
      // Cargar settings al abrir el modal
      const settingsRes = await settingsApi.get();
      setSettings(settingsRes);
      // Cargar historial de pagos
      const paymentsRes = await axios.get(`/api/invoices/${invoice.id}/payments`);
      setPayments(paymentsRes.data);
      setShowDetailModal(true);
    } catch (err) {
      setError("Error al cargar los detalles de la factura");
    }
  };

  const openPaidModal = (invoice: Invoice) => {
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
      await axios.put(`/api/invoices/${paidInvoice.id}`, {
        ...paidInvoice,
        status: paidType,
        amountPaid,
        paidAt: paidDate,
        items: paidInvoice.items || [],
        client: paidInvoice.client || undefined
      });
      setShowPaidModal(false);
      fetchInvoices();
      alert('Factura actualizada');
    } catch (err) {
      alert('Error al marcar como pagada');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (searchDate) params.append('date', searchDate);
      if (searchTotal) params.append('total', searchTotal);
      const res = await axios.get(`/api/invoices/search?${params.toString()}`);
      setInvoices(res.data);
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
          {selectedIds.length > 0 && (
            <button
              onClick={() => pdfApi.downloadMultipleInvoices(selectedIds)}
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
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 items-end">
        <div>
          <label className="block text-xs font-medium">Cliente o número</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="border rounded px-2 py-1" placeholder="Buscar..." />
        </div>
        <div>
          <label className="block text-xs font-medium">Fecha</label>
          <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs font-medium">Total</label>
          <input type="number" step="0.01" value={searchTotal} onChange={e => setSearchTotal(e.target.value)} className="border rounded px-2 py-1" placeholder="€" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">Buscar</button>
        <button type="button" onClick={() => { setSearch(''); setSearchDate(''); setSearchTotal(''); fetchInvoices(); }} className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400">Limpiar</button>
      </form>

      <div className="overflow-x-auto">
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
              <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(invoice)}>
                <td className="border px-4 py-2">
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
                <td className="border px-4 py-2">
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); openPaidModal(invoice); }}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      title="Marcar como pagada o pagada parcialmente"
                    >
                      Marcar pagada
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  onChange={(e) => setEditingInvoice({...editingInvoice, client: { id: e.target.value, name: editingInvoice?.client?.name || "" }})}
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
                  onChange={(e) => setEditingInvoice({...editingInvoice, status: e.target.value})}
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

      {/* Modal de detalles */}
      {showDetailModal && selectedInvoice && settings && selectedInvoice.client && selectedInvoice.items && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-transparent p-0 rounded-lg max-w-3xl w-full flex flex-col items-center">
            <div className="relative w-full">
              <div className="flex justify-end gap-2 pr-8 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 z-10"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => pdfApi.downloadInvoice(selectedInvoice.id)}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Exportar a PDF
                </button>
              </div>
              <div id="invoice-preview-modal" className="pt-4 pb-4 px-2">
                <InvoicePreview invoice={{...selectedInvoice, client: selectedInvoice.client, items: selectedInvoice.items}} settings={settings} />
                {payments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-gray-700">Historial de pagos</h3>
                    <table className="w-full text-sm border rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 text-left">Fecha</th>
                          <th className="px-2 py-1 text-right">Importe</th>
                          <th className="px-2 py-1 text-center">Tipo</th>
                          <th className="px-2 py-1 text-left">Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p, idx) => (
                          <tr key={p.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                            <td className="px-2 py-1">{new Date(p.date).toLocaleDateString()}</td>
                            <td className="px-2 py-1 text-right">{p.amount.toFixed(2)} €</td>
                            <td className="px-2 py-1 text-center">{p.type === 'PAID' ? 'Total' : 'Parcial'}</td>
                            <td className="px-2 py-1">{p.note || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
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
    </div>
  );
};

export default Invoices; 