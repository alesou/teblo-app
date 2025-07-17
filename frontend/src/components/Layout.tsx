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
import { loadStripe } from '@stripe/stripe-js';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();

  // Debug: Log environment variables on component mount
  console.log('Environment variables check - Updated:', new Date().toISOString());
  console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  console.log('VITE_STRIPE_DONATION_PRICE_ID:', import.meta.env.VITE_STRIPE_DONATION_PRICE_ID);
  
  // Force environment variables reload - FORCE REDEPLOY
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const priceId = import.meta.env.VITE_STRIPE_DONATION_PRICE_ID || process.env.VITE_STRIPE_DONATION_PRICE_ID;
  
  console.log('Stripe key (forced):', stripeKey);
  console.log('Price ID (forced):', priceId);

  const handleDonation = async () => {
    try {
      console.log('Donation button clicked');
      
      // Use forced environment variables
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const priceId = import.meta.env.VITE_STRIPE_DONATION_PRICE_ID || process.env.VITE_STRIPE_DONATION_PRICE_ID;
      
      console.log('Stripe key:', stripeKey);
      console.log('Price ID:', priceId);
      
      // Verificar que las variables de entorno estén definidas
      if (!stripeKey) {
        console.error('Stripe publishable key not found');
        alert('Error: Stripe no está configurado correctamente');
        return;
      }
      
      if (!priceId) {
        console.error('Stripe donation price ID not found');
        alert('Error: ID de precio de donación no encontrado');
        return;
      }

      // Cargar Stripe
      const stripe = await loadStripe(stripeKey);
      if (!stripe) {
        console.error('Stripe failed to load');
        alert('Error: No se pudo cargar Stripe');
        return;
      }

      console.log('Stripe loaded successfully');

      // Redirigir a Stripe Checkout para donaciones
      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        successUrl: `${window.location.origin}/?success=true`,
        cancelUrl: `${window.location.origin}/?canceled=true`,
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Error al procesar la donación');
    }
  };

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
              <button
                onClick={handleDonation}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-pink-600 hover:bg-pink-50 hover:text-pink-700 rounded-lg transition-colors"
              >
                <Heart className="mr-3 h-5 w-5" />
                Apoyar Teblo
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
    </div>
  );
};

export default Layout; 