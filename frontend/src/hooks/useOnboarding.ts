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
        
        // Si no hay configuración o el nombre de la empresa está vacío, necesita onboarding
        const needsSetup = !settings || !settings.companyName || settings.companyName.trim() === '';
        setNeedsOnboarding(needsSetup);
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