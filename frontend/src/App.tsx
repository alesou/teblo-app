import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import CreateInvoice from './pages/CreateInvoice';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { useOnboarding } from './hooks/useOnboarding';

// Auth context
export const AuthContext = createContext<{ user: User | null }>({ user: null });
export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || onboardingLoading) return <div>Cargando...</div>;
  if (!user) return <Welcome />;

  // Si el usuario necesita onboarding, mostrar la página de onboarding
  if (needsOnboarding) {
    return <Onboarding />;
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<CreateInvoice />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </AuthContext.Provider>
  );
}

export default App; 