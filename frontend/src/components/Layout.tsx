import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  Plus
} from 'lucide-react';
import { useAuth } from '../App';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Facturas', href: '/invoices', icon: FileText },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600 font-poppins">Teblo</h1>
        </div>
        {/* Usuario autenticado */}
        {user && (
          <div className="flex flex-col items-center py-4 border-b border-gray-100">
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" className="w-12 h-12 rounded-full mb-2 border shadow" />
            )}
            <div className="font-semibold text-gray-800 text-sm text-center">{user.displayName || user.email}</div>
            {user.displayName && user.email && (
              <div className="text-xs text-gray-500 text-center">{user.email}</div>
            )}
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300"
              onClick={() => signOut(auth)}
            >
              Cerrar sesión
            </button>
          </div>
        )}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          {/* Quick Actions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Acciones Rápidas
            </h3>
            <div className="mt-4 space-y-2">
              <Link
                to="/invoices/new"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <Plus className="mr-3 h-5 w-5" />
                Nueva Factura
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8 px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 