import { useState, useEffect } from 'react';
import { settingsApi } from '../services/api';
import { useAuth } from '../App';

export const useOnboarding = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboarding = async () => {
      console.log('🔍 Checking onboarding for user:', user?.uid);
      
      // Solo verificar si el usuario está autenticado
      if (!user) {
        console.log('❌ No user found, skipping onboarding check');
        setNeedsOnboarding(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Fetching settings from API...');
        const settings = await settingsApi.get();
        console.log('📋 Settings received:', settings);
        
        // Verificar si faltan los campos obligatorios: nombre, CIF y dirección
        const hasRequiredFields = settings && 
          settings.companyName && 
          settings.companyName.trim() !== '' &&
          settings.companyNif && 
          settings.companyNif.trim() !== '' &&
          settings.companyAddress && 
          settings.companyAddress.trim() !== '';
        
        console.log('✅ Has required fields:', hasRequiredFields);
        console.log('📝 Company name:', settings?.companyName);
        console.log('📝 Company NIF:', settings?.companyNif);
        console.log('📝 Company address:', settings?.companyAddress);
        
        setNeedsOnboarding(!hasRequiredFields);
      } catch (error: any) {
        console.error('❌ Error checking onboarding:', error);
        console.error('❌ Error status:', error?.response?.status);
        console.error('❌ Error message:', error?.message);
        
        // Si es un error 401, el usuario necesita onboarding
        if (error?.response?.status === 401) {
          console.log('🔐 401 error - user needs onboarding');
          setNeedsOnboarding(true);
        } else {
          // Para otros errores, asumimos que necesita onboarding
          console.log('⚠️ Other error - assuming user needs onboarding');
          setNeedsOnboarding(true);
        }
      } finally {
        setLoading(false);
        console.log('🏁 Onboarding check completed. Needs onboarding:', needsOnboarding);
      }
    };

    checkOnboarding();
  }, [user]);

  return { needsOnboarding, loading };
}; 