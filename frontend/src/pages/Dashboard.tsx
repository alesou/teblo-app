import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { invoicesApi, clientsApi } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery(
    'invoices',
    invoicesApi.getAll
  );

  const { data: clients = [], isLoading: clientsLoading } = useQuery(
    'clients',
    clientsApi.getAll
  );

  const [totalPayments, setTotalPayments] = useState(0);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Cargar pagos de todas las facturas
  useEffect(() => {
    const loadAllPayments = async () => {
      if (invoices.length === 0) return;
      
      setLoadingPayments(true);
      let total = 0;
      
      for (const invoice of invoices) {
        try {
          const payments = await invoicesApi.getPayments(invoice.id);
          const invoiceTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
          total += invoiceTotal;
        } catch (err) {
          console.error(`Error loading payments for invoice ${invoice.id}:`, err);
        }
      }
      
      setTotalPayments(total);
      setLoadingPayments(false);
    };

    loadAllPayments();
  }, [invoices]);

  const pendingInvoices = invoices.filter(invoice => invoice.status === 'PENDING');
  
  // Calcular ingresos totales incluyendo pagos parciales
  const totalRevenue = totalPayments;
  const pendingRevenue = pendingInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const recentInvoices = invoices.slice(0, 5);

  if (invoicesLoading || clientsLoading || loadingPayments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen de tu actividad de facturación</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/invoices/new"
            className="btn btn-primary flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Facturas</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Incluye pagos parciales
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendiente de Cobro</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(pendingRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Facturas Recientes</h2>
          <Link
            to="/invoices"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todas
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primera factura.
            </p>
            <div className="mt-6">
              <Link
                to="/invoices/new"
                className="btn btn-primary"
              >
                Crear Factura
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(invoice.date), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status === 'PAID' ? 'Pagada' : 
                         invoice.status === 'PENDING' ? 'Pendiente' : 'Cancelada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 