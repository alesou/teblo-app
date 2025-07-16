import axios from 'axios';
import { getAuth } from 'firebase/auth';
import {
  Client,
  Invoice,
  Settings,
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateClientData,
  UpdateClientData,
  UpdateSettingsData
} from '../types';

// API configuration for separate backend service
const getApiUrl = () => {
  // Production: use environment variable or real backend URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.teblo.app';
  }
  // Development: use local backend
  return 'http://localhost:3001';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  console.log('Request interceptor called for:', config.url);
  console.log('Current user:', user ? user.uid : 'No user');
  console.log('User email:', user?.email);
  console.log('User emailVerified:', user?.emailVerified);
  
  if (user && user.uid) {
    try {
      // Force token refresh to ensure we get a fresh token
      const token = await user.getIdToken(true);
      console.log('Token obtained, length:', token.length);
      console.log('Token preview:', token.substring(0, 50) + '...');
      
      if (token && token.length > 100) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set successfully');
      } else {
        console.error('Token too short or invalid:', token);
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      // If token refresh fails, try to get the current token
      try {
        const currentToken = await user.getIdToken();
        if (currentToken && currentToken.length > 100) {
          config.headers.Authorization = `Bearer ${currentToken}`;
          console.log('Fallback token set successfully');
        }
      } catch (fallbackError) {
        console.error('Fallback token error:', fallbackError);
      }
    }
  } else {
    console.log('No authenticated user found');
  }
  
  return config;
});

// Clients API
export const clientsApi = {
  getAll: () => api.get<Client[]>('/api/clients').then(res => res.data),
  getById: (id: string) => api.get<Client>(`/api/clients/${id}`).then(res => res.data),
  create: (data: CreateClientData) => api.post<Client>('/api/clients', data).then(res => res.data),
  update: (id: string, data: UpdateClientData) => api.put<Client>(`/api/clients/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/clients/${id}`).then(res => res.data),
};

// Invoices API
export const invoicesApi = {
  getAll: () => api.get<Invoice[]>('/api/invoices').then(res => res.data),
  getById: (id: string) => api.get<Invoice>(`/api/invoices/${id}`).then(res => res.data),
  create: (data: CreateInvoiceData) => api.post<Invoice>('/api/invoices', data).then(res => res.data),
  update: (id: string, data: UpdateInvoiceData) => api.put<Invoice>(`/api/invoices/${id}`, data).then(res => res.data),
  updateStatus: (id: string, status: 'PENDING' | 'PAID' | 'CANCELLED') => 
    api.patch<Invoice>(`/api/invoices/${id}/status`, { status }).then(res => res.data),
  delete: (id: string) => api.delete(`/api/invoices/${id}`).then(res => res.data),
};

// Settings API
export const settingsApi = {
  get: () => api.get<Settings>('/api/settings').then(res => res.data),
  update: (data: UpdateSettingsData) => api.put<Settings>('/api/settings', data).then(res => res.data),
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