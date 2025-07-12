import React from "react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  vatRate: number;
}

interface Client {
  name: string;
  nif?: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface Invoice {
  number: string;
  date: string;
  dueDate?: string;
  status: string;
  total: number;
  notes?: string;
  client: Client;
  items: InvoiceItem[];
}

interface Settings {
  companyName: string;
  companyNif?: string;
  companyAddress?: string;
  logoUrl?: string;
}

interface Props {
  invoice: Invoice;
  settings: Settings;
}

const InvoicePreview: React.FC<Props> = ({ invoice, settings }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("es-ES");

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalIVA = invoice.items.reduce((sum, item) => sum + item.quantity * item.price * (item.vatRate / 100), 0);

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl mx-auto border relative text-gray-900">
      {/* Encabezado */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          {settings.logoUrl && (
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
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-700">FACTURA</div>
          <div className="text-sm">Nº: <b>{invoice.number}</b></div>
          <div className="text-sm">Fecha: {formatDate(invoice.date)}</div>
          {invoice.dueDate && <div className="text-sm">Vencimiento: {formatDate(invoice.dueDate)}</div>}
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              invoice.status === "PAID"
                ? "bg-green-100 text-green-800"
                : invoice.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {invoice.status === "PAID"
                ? "Pagada"
                : invoice.status === "CANCELLED"
                ? "Cancelada"
                : "Pendiente"}
            </span>
          </div>
        </div>
      </div>
      {/* Cliente */}
      <div className="mb-6 bg-gray-50 rounded p-4">
        <div className="font-semibold text-gray-700 mb-1">Cliente</div>
        <div className="font-bold">{invoice.client.name}</div>
        {invoice.client.nif && <div className="text-sm">NIF/CIF: {invoice.client.nif}</div>}
        {invoice.client.address && <div className="text-sm">Dirección: {invoice.client.address}</div>}
        {invoice.client.email && <div className="text-sm">Email: {invoice.client.email}</div>}
        {invoice.client.phone && <div className="text-sm">Teléfono: {invoice.client.phone}</div>}
      </div>
      {/* Tabla de items */}
      <table className="w-full mb-6 border rounded overflow-hidden">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-right">Cantidad</th>
            <th className="p-2 text-right">Precio</th>
            <th className="p-2 text-right">IVA (%)</th>
            <th className="p-2 text-right">Subtotal</th>
            <th className="p-2 text-right">IVA</th>
            <th className="p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => {
            const sub = item.quantity * item.price;
            const iva = sub * (item.vatRate / 100);
            return (
              <tr key={item.id} className="border-b last:border-b-0">
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                <td className="p-2 text-right">{item.vatRate}%</td>
                <td className="p-2 text-right">{formatCurrency(sub)}</td>
                <td className="p-2 text-right">{formatCurrency(iva)}</td>
                <td className="p-2 text-right font-bold">{formatCurrency(sub + iva)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Totales */}
      <div className="flex justify-end mb-4">
        <div className="w-64 space-y-1">
          <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span>IVA:</span><span>{formatCurrency(totalIVA)}</span></div>
          <div className="flex justify-between font-bold text-lg bg-blue-50 rounded px-2 py-1"><span>Total:</span><span>{formatCurrency(invoice.total)}</span></div>
        </div>
      </div>
      {/* Notas */}
      {invoice.notes && (
        <div className="mt-4 bg-gray-50 rounded p-4">
          <b>Notas:</b> {invoice.notes}
        </div>
      )}
    </div>
  );
};

export default InvoicePreview; 