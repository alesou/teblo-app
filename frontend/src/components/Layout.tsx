import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  Plus,
  Heart,
  Menu,
  X
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600 font-poppins">Teblo</h1>
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border shadow" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 text-sm truncate">
                {user.displayName || user.email}
              </div>
              {user.displayName && user.email && (
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              )}
            </div>
          </div>
          <button
            className="mt-3 w-full px-3 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
            onClick={() => signOut(auth)}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Acciones Rápidas
          </h3>
          <div className="space-y-1">
            <Link
              to="/invoices/new"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <Plus className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Nueva Factura</span>
            </Link>
            <button
              onClick={() => {
                setShowDonationModal(true);
                setSidebarOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors"
            >
              <Heart className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Donar</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );

  // Get current page title
  const getPageTitle = () => {
    const currentPage = navigation.find(item => item.href === location.pathname);
    if (location.pathname === '/invoices/new') return 'Crear Factura';
    if (location.pathname === '/clients') return 'Clientes';
    if (location.pathname === '/invoices') return 'Facturas';
    if (location.pathname === '/settings') return 'Configuración';
    return currentPage?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>
          {location.pathname === '/invoices' && (
            <Link
              to="/invoices/new"
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva
            </Link>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="pt-16 lg:pt-8 px-4 lg:px-8 pb-8">
          {children}
        </main>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
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
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{option.name}</div>
                      <div className="text-sm text-gray-500 truncate">{option.description}</div>
                    </div>
                    <div className="text-lg font-bold text-primary-600 flex-shrink-0 ml-2">€{option.amount}</div>
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