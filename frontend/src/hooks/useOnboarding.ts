import { useState, useEffect } from 'react';
import { settingsApi } from '../services/api';

export const useOnboarding = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
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
      } catch (error) {
        // Si hay error al obtener settings, asumimos que necesita onboarding
        setNeedsOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  return { needsOnboarding, loading };
}; 