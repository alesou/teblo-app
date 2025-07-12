import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { invoicesApi, pdfApi } from '../services/api';

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
  const [conceptos, setConceptos] = useState<Concepto[]>([{ ...initialConcepto }]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [terminos, setTerminos] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get("/api/clients").then(res => setClientes(res.data));
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
    try {
      // Crear factura en backend
      const factura = await invoicesApi.create({
        clientId: clienteId,
        date: fecha,
        dueDate: undefined, // No null, para evitar error de tipo
        items: conceptos.map(c => ({
          description: c.descripcion,
          quantity: c.cantidad,
          price: c.precio,
          vatRate: c.iva
        })),
        notes: notas
      });
      alert("Factura guardada correctamente. Se descargará el PDF.");
      // Descargar PDF profesional
      await pdfApi.downloadInvoice(factura.id);
    } catch (err) {
      alert("Error al guardar o exportar la factura");
    }
  };

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
          {conceptos.map((c, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-end">
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
              <input
                type="number"
                className="border rounded px-2 py-1 w-16"
                min={0}
                max={21}
                value={c.iva}
                onChange={e => handleConceptoChange(idx, "iva", Number(e.target.value))}
                required
              />
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
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Guardar factura y descargar PDF
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