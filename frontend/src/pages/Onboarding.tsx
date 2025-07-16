import React, { useState } from "react";
import { settingsApi } from "../services/api";
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface Settings {
  companyName: string;
  companyNif?: string;
  companyAddress?: string;
  invoicePrefix: string;
  nextNumber: number;
  companyPhone?: string;
  companyWeb?: string;
}

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [settings, setSettings] = useState<Settings>({
    companyName: "",
    companyNif: "",
    companyAddress: "",
    invoicePrefix: "FAC",
    nextNumber: 1,
    companyPhone: "",
    companyWeb: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSubmit called with settings:', settings);
    
    if (!settings.companyName.trim()) {
      setError("El nombre de la empresa es obligatorio");
      return;
    }
    if (!settings.companyNif?.trim()) {
      setError("El CIF/NIF es obligatorio");
      return;
    }
    if (!settings.companyAddress?.trim()) {
      setError("La dirección es obligatoria");
      return;
    }
    
    console.log('✅ Validation passed, saving settings...');
    setSaving(true);
    setError(null);
    
    try {
      console.log('📡 Calling settingsApi.update...');
      await settingsApi.update(settings);
      console.log('✅ Settings saved successfully, navigating to dashboard...');
      // Forzar recarga para que el estado de onboarding se actualice
      window.location.href = '/';
    } catch (err: any) {
      console.error('❌ Error saving settings:', err);
      console.error('❌ Error response:', err?.response);
      console.error('❌ Error status:', err?.response?.status);
      
      // Si es un error 401, hacer logout y redirigir al login
      if (err?.response?.status === 401) {
        setError("Error de autenticación. Serás redirigido al login.");
        setTimeout(async () => {
          await signOut(auth);
          window.location.href = '/';
        }, 2000);
      } else {
        setError("Error al guardar la configuración");
      }
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!settings.companyName.trim()) {
        setError("El nombre de la empresa es obligatorio");
        return;
      }
      if (!settings.companyNif?.trim()) {
        setError("El CIF/NIF es obligatorio");
        return;
      }
      if (!settings.companyAddress?.trim()) {
        setError("La dirección es obligatoria");
        return;
      }
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a Teblo!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Vamos a configurar tu empresa para que puedas empezar a crear facturas profesionales.
        </p>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Información obligatoria
          </h2>
          <ul className="text-left text-blue-800 space-y-2">
            <li className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Nombre de la empresa *
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              CIF/NIF *
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              Dirección *
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              Información adicional (opcional)
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
              Configuración de facturas
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">
            Nombre de la empresa *
          </label>
          <input
            type="text"
            name="companyName"
            value={settings.companyName}
            onChange={handleInput}
            className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            placeholder="Ej: Mi Empresa S.L."
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">
            CIF/NIF *
          </label>
          <input
            type="text"
            name="companyNif"
            value={settings.companyNif || ""}
            onChange={handleInput}
            className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            placeholder="Ej: B12345678"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">
            Dirección *
          </label>
          <input
            type="text"
            name="companyAddress"
            value={settings.companyAddress || ""}
            onChange={handleInput}
            className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            placeholder="Ej: Calle Principal 123, Madrid"
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4 mt-4">{error}</div>
      )}

      <button
        onClick={nextStep}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors mt-6"
        disabled={!settings.companyName.trim() || !settings.companyNif?.trim() || !settings.companyAddress?.trim()}
      >
        Continuar
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Información adicional
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Esta información aparecerá en tus facturas. Puedes completarla más tarde.
        </p>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="text"
            name="companyPhone"
            value={settings.companyPhone || ""}
            onChange={handleInput}
            className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Ej: 961234567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sitio web
          </label>
          <input
            type="text"
            name="companyWeb"
            value={settings.companyWeb || ""}
            onChange={handleInput}
            className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Ej: www.miempresa.com"
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={prevStep}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Configuración de facturas
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Configura cómo quieres que se numeren tus facturas.
        </p>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prefijo de factura *
          </label>
          <input
            type="text"
            name="invoicePrefix"
            value={settings.invoicePrefix}
            onChange={handleInput}
            className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Ej: FAC"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Ejemplo: FAC-001, FAC-002, etc.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Próximo número de factura *
          </label>
          <input
            type="number"
            name="nextNumber"
            value={settings.nextNumber}
            onChange={handleInput}
            className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg focus:border-blue-500 focus:outline-none"
            min={1}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            La primera factura será: {settings.invoicePrefix}-{settings.nextNumber}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mt-4">{error}</div>
      )}

      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={prevStep}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          disabled={saving}
        >
          {saving ? "Guardando..." : "¡Empezar a usar Teblo!"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Paso {currentStep} de 3
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default Onboarding; 