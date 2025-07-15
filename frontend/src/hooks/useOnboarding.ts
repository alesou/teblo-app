import { useState, useEffect } from 'react';
import { settingsApi } from '../services/api';
import { useAuth } from '../App';

export const useOnboarding = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboarding = async () => {
      // Solo verificar si el usuario está autenticado
      if (!user) {
        setNeedsOnboarding(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const settings = await settingsApi.get();
        
        // Verificar si faltan los campos obligatorios: nombre, CIF y dirección
        const hasRequiredFields = settings && 
          settings.companyName && 
          settings.companyName.trim() !== '' &&
          settings.companyNif && 
          settings.companyNif.trim() !== '' &&
          settings.companyAddress && 
          settings.companyAddress.trim() !== '';
        
        setNeedsOnboarding(!hasRequiredFields);
      } catch (error: any) {
        console.error('Error checking onboarding:', error);
        
        // Si es un error 401, el usuario necesita onboarding
        if (error?.response?.status === 401) {
          setNeedsOnboarding(true);
        } else {
          // Para otros errores, asumimos que necesita onboarding
          setNeedsOnboarding(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user]);

  return { needsOnboarding, loading };
}; 