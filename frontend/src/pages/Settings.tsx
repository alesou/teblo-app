import React, { useEffect, useState } from "react";
import { settingsApi } from "../services/api";

interface Settings {
  companyName: string;
  companyNif?: string;
  companyAddress?: string;
  logoUrl?: string;
  invoicePrefix: string;
  nextNumber: number;
  companyPhone?: string;
  companyWeb?: string;
}

const defaultSettings: Settings = {
  companyName: "",
  companyNif: "",
  companyAddress: "",
  logoUrl: "",
  invoicePrefix: "FAC",
  nextNumber: 1,
  companyPhone: "",
  companyWeb: "",
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsApi.get();
        setSettings(data as Settings);
        setError(null);
      } catch (err: any) {
        setError("Error al cargar la configuración");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await fetch('https://api.teblo.app/api/settings/upload-logo', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir el logo');
      }
      
      const data = await response.json();
      const logoUrl = `https://api.teblo.app${data.url}`;
      setSettings({ ...settings, logoUrl });
      alert('Logo subido correctamente');
    } catch (err) {
      console.error('Error uploading logo:', err);
      alert('Error al subir el logo. Por favor, intenta de nuevo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await settingsApi.update(settings);
      setSuccess(true);
    } catch (err: any) {
      setError("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuración de la Empresa</h1>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">¡Configuración guardada!</div>}
      {!loading && !error && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre de la empresa *</label>
            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">NIF</label>
            <input
              type="text"
              name="companyNif"
              value={settings.companyNif || ""}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dirección</label>
            <input
              type="text"
              name="companyAddress"
              value={settings.companyAddress || ""}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full border px-3 py-2 rounded"
            />
            {settings.logoUrl && (
              <div className="mt-2">
                <img src={settings.logoUrl.startsWith('http') ? settings.logoUrl : settings.logoUrl} alt="Logo" style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain', background: '#fff', borderRadius: 8, border: '1px solid #eee' }} />
              </div>
            )}
            <input
              type="text"
              name="logoUrl"
              value={settings.logoUrl || ""}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded mt-2"
              placeholder="o pega una URL de imagen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input
              type="text"
              name="companyPhone"
              value={settings.companyPhone || ""}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded"
              placeholder="Ej: 961234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Web</label>
            <input
              type="text"
              name="companyWeb"
              value={settings.companyWeb || ""}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded"
              placeholder="Ej: www.miempresa.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Prefijo de factura *</label>
            <input
              type="text"
              name="invoicePrefix"
              value={settings.invoicePrefix}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Próximo número de factura *</label>
            <input
              type="number"
              name="nextNumber"
              value={settings.nextNumber}
              onChange={handleInput}
              className="w-full border px-3 py-2 rounded"
              required
              min={1}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SettingsPage; 