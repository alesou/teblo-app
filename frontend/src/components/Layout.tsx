import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  Plus,
  Heart
} from 'lucide-react';
import { useAuth } from '../App';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [showDonationModal, setShowDonationModal] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Facturas', href: '/invoices', icon: FileText },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  const donationOptions = [
    {
      name: 'Café ☕',
      amount: 3,
      description: 'Un café para mantener Teblo funcionando'
    },
    {
      name: 'Almuerzo 🍕',
      amount: 10,
      description: 'Un almuerzo para seguir mejorando Teblo'
    },
    {
      name: 'Cena 🍽️',
      amount: 25,
      description: 'Una cena para nuevas funcionalidades'
    },
    {
      name: 'Patrocinador 💎',
      amount: 50,
      description: 'Patrocinador oficial de Teblo'
    }
  ];

  const handleDonation = (amount: number) => {
    // Ko-fi - La opción más simple
    const kofiUrl = `https://ko-fi.com/tebloapp?amount=${amount * 100}`;
    window.open(kofiUrl, '_blank');
    setShowDonationModal(false);
  };

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
              <button
                onClick={() => setShowDonationModal(true)}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors"
              >
                <Heart className="mr-3 h-5 w-5" />
                Donar
              </button>
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

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">¿Te gusta Teblo? ❤️</h2>
            <button
              onClick={() => setShowDonationModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Si Teblo te está ayudando en tu negocio, considera hacer una donación para mantener el proyecto vivo y seguir mejorando la aplicación.
          </p>

            <div className="space-y-3">
              {donationOptions.map((option) => (
                              <button
                key={option.name}
                onClick={() => handleDonation(option.amount)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  <div className="text-lg font-bold text-primary-600">€{option.amount}</div>
                </div>
              </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Las donaciones ayudan a mantener Teblo gratis, sin anuncios y en constante mejora
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout; 