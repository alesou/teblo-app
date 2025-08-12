import axios from 'axios';
import type {
  Invoice,
  Settings
} from '../types';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(async (config) => {
  // Bypass para modo testing
  if (import.meta.env.VITE_TESTING_MODE === 'true') {
    console.log('🧪 Testing mode - bypassing API calls');
    return config;
  }

  console.log('🔐 API Interceptor - Checking authentication...');
  
  try {
    // Obtener token de Firebase
    const { auth } = await import('../firebase');
    console.log('🔥 Firebase auth imported successfully');
    
    const user = auth.currentUser;
    console.log('👤 Current user:', user ? user.uid : 'NO USER');
    
    if (user) {
      console.log('✅ User found, getting ID token...');
      const token = await user.getIdToken();
      console.log('🎫 Token obtained, length:', token.length);
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Authorization header set successfully');
    } else {
      console.log('❌ No user found in Firebase auth');
    }
  } catch (error) {
    console.error('💥 Error in API interceptor:', error);
  }
  
  console.log('📤 Request config:', {
    url: config.url,
    method: config.method,
    hasAuth: !!config.headers.Authorization
  });
  
  return config;
});

// Datos mock para modo testing
const mockData = {
  clients: [
    { id: '1', name: 'Cliente Ejemplo 1', email: 'cliente1@ejemplo.com', phone: '123456789' },
    { id: '2', name: 'Cliente Ejemplo 2', email: 'cliente2@ejemplo.com', phone: '987654321' }
  ],
  invoices: [
    { 
      id: '1', 
      number: 'F-001', 
      date: '2024-01-15', 
      total: 1500.00, 
      status: 'PENDING',
      client: { name: 'Cliente Ejemplo 1' }
    },
    { 
      id: '2', 
      number: 'F-002', 
      date: '2024-01-20', 
      total: 2300.00, 
      status: 'PAID',
      client: { name: 'Cliente Ejemplo 2' }
    }
  ],
  settings: {
    companyName: 'Empresa Ejemplo',
    companyNif: 'B12345678',
    companyAddress: 'Calle Ejemplo 123, Madrid',
    companyEmail: 'info@empresa.com',
    companyPhone: '912345678'
  }
};

// APIs
export const clientsApi = {
  getAll: async () => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return mockData.clients;
    }
    const response = await api.get('/clients');
    return response.data;
  },
  create: async (data: any) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { ...data, id: Date.now().toString() };
    }
    const response = await api.post('/clients', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { ...data, id };
    }
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { success: true };
    }
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};

export const invoicesApi = {
  getAll: async () => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return mockData.invoices;
    }
    const response = await api.get('/invoices');
    return response.data;
  },
  create: async (data: any) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { ...data, id: Date.now().toString(), number: `F-${Date.now()}` };
    }
    const response = await api.post('/invoices', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { ...data, id };
    }
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { success: true };
    }
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
  getPayments: async (id: string) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return [];
    }
    const response = await api.get(`/invoices/${id}/payments`);
    return response.data;
  },
  addPayment: async (id: string, data: any) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { ...data, id: Date.now().toString() };
    }
    const response = await api.post(`/invoices/${id}/payments`, data);
    return response.data;
  }
};

export const settingsApi = {
  get: async () => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return mockData.settings;
    }
    const response = await api.get('/settings');
    return response.data;
  },
  update: async (data: any) => {
    if (import.meta.env.VITE_TESTING_MODE === 'true') {
      return { ...mockData.settings, ...data };
    }
    const response = await api.put('/settings', data);
    return response.data;
  }
};

// PDF API - Frontend generation
export const pdfApi = {
  downloadInvoice: async (_invoice: Invoice, _settings: Settings) => {
    // This will be handled by the PDFGenerator component
    return Promise.resolve();
  },
  downloadMultipleInvoices: async (_invoices: Invoice[], _settings: Settings) => {
    // This will be handled by the PDFGenerator component
    return Promise.resolve();
  },
};

export default api; 