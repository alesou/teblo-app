import React, { useEffect, useState } from "react";
import axios from "axios";

interface Client {
  id: string;
  name: string;
  nif?: string;
  address?: string;
  email?: string;
  phone?: string;
}

const initialForm = { name: "", nif: "", address: "", email: "", phone: "" };

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [clientTotal, setClientTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/clients");
      setClients(res.data);
      setError(null);
    } catch (err: any) {
      setError("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openEdit = (client: Client) => {
    setEditId(client.id);
    setForm({
      name: client.name,
      nif: client.nif || "",
      address: client.address || "",
      email: client.email || "",
      phone: client.phone || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await axios.put(`/api/clients/${editId}`, form);
      } else {
        await axios.post("/api/clients", form);
      }
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
      fetchClients();
    } catch (err: any) {
      setFormError("Error al guardar el cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setDeleteError(null);
    try {
      await axios.delete(`/api/clients/${id}`);
      fetchClients();
    } catch (err: any) {
      setDeleteError("No se puede eliminar el cliente (puede tener facturas asociadas)");
    } finally {
      setDeleteId(null);
    }
  };

  const handleShowInvoices = async (client: Client) => {
    setSelectedClient(client);
    try {
      const res = await axios.get(`/api/invoices?clientId=${client.id}`);
      setClientInvoices(res.data);
      setClientTotal(res.data.reduce((sum: number, inv: any) => sum + inv.total, 0));
      setShowInvoicesModal(true);
    } catch (err) {
      alert('Error al cargar facturas del cliente');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); }}
        >
          Nuevo Cliente
        </button>
      </div>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">NIF</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Teléfono</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="border px-4 py-2 text-blue-600 underline cursor-pointer" onClick={() => handleShowInvoices(client)}>{client.name}</td>
                <td className="py-2 px-4 border-b">{client.nif || "-"}</td>
                <td className="py-2 px-4 border-b">{client.email || "-"}</td>
                <td className="py-2 px-4 border-b">{client.phone || "-"}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="text-blue-600 hover:underline mr-2"
                    onClick={() => openEdit(client)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(client.id)}
                    disabled={deleteId === client.id}
                  >
                    {deleteId === client.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {deleteError && <div className="text-red-500 mt-2">{deleteError}</div>}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => { setShowModal(false); setEditId(null); setForm(initialForm); }}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">{editId ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">NIF</label>
                <input
                  type="text"
                  name="nif"
                  value={form.nif}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                disabled={saving}
              >
                {saving ? "Guardando..." : editId ? "Guardar Cambios" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
      {showInvoicesModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Facturas de {selectedClient.name}</h2>
            <table className="w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Número</th>
                  <th className="px-2 py-1 text-right">Fecha</th>
                  <th className="px-2 py-1 text-right">Total</th>
                  <th className="px-2 py-1 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="px-2 py-1">{inv.number}</td>
                    <td className="px-2 py-1 text-right">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-2 py-1 text-right">{inv.total.toFixed(2)} €</td>
                    <td className="px-2 py-1 text-center">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="font-bold text-right mb-2">Total facturado: {clientTotal.toFixed(2)} €</div>
            <div className="flex justify-end">
              <button onClick={() => setShowInvoicesModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients; 