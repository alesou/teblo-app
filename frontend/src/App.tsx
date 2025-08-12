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

// Auth context
export const AuthContext = createContext<{ user: User | null }>({ user: null });
export const useAuth = () => useContext(AuthContext);

// Bypass temporal para testing de internacionalización
const TESTING_MODE = import.meta.env.VITE_TESTING_MODE === 'true';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('👤 Auth state changed:', firebaseUser?.uid);
      setUser(firebaseUser);
      setLoading(false);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  // Check onboarding when user is authenticated
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!authChecked || !user) {
        console.log('⏳ Waiting for auth...');
        return;
      }

      console.log('🔍 Checking onboarding for user:', user.uid);
      setOnboardingLoading(true);

      try {
        const response = await fetch('https://api.teblo.app/api/settings', {
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Settings API response status:', response.status);

        if (response.status === 404) {
          console.log('✅ No settings found - user needs onboarding');
          setNeedsOnboarding(true);
        } else if (response.ok) {
          const settings = await response.json();
          console.log('📋 Settings found:', settings);
          
          const hasRequiredFields = settings && 
            settings.companyName && 
            settings.companyName.trim() !== '' &&
            settings.companyNif && 
            settings.companyNif.trim() !== '' &&
            settings.companyAddress && 
            settings.companyAddress.trim() !== '';
          
          console.log('✅ Has required fields:', hasRequiredFields);
          setNeedsOnboarding(!hasRequiredFields);
        } else {
          console.log('⚠️ API error - assuming onboarding needed');
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error('❌ Error checking onboarding:', error);
        setNeedsOnboarding(true);
      } finally {
        setOnboardingLoading(false);
      }
    };

    checkOnboarding();
  }, [authChecked, user]);

  console.log('🎯 App render state:', {
    loading,
    user: user?.uid,
    authChecked,
    needsOnboarding,
    onboardingLoading
  });

  // Bypass para testing de internacionalización
  if (TESTING_MODE) {
    console.log('🧪 Testing mode enabled - bypassing auth');
    return (
      <AuthContext.Provider value={{ user: { uid: 'test-user' } as User }}>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="clients" element={<Layout><Clients /></Layout>} />
          <Route path="invoices" element={<Layout><Invoices /></Layout>} />
          <Route path="settings" element={<Layout><Settings /></Layout>} />
          <Route path="invoices/new" element={<Layout><CreateInvoice /></Layout>} />
        </Routes>
      </AuthContext.Provider>
    );
  }

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Welcome />;

  // Show onboarding if needed
  if (authChecked && user && needsOnboarding && !onboardingLoading) {
    console.log('🚀 Showing onboarding for user:', user.uid);
    return <Onboarding />;
  }

  console.log('🏠 Showing main app for user:', user?.uid);

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