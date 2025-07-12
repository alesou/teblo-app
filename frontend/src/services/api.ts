import axios from 'axios';
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

// PDF API
export const pdfApi = {
  downloadInvoice: (id: string) => {
    return api.get(`/api/pdf/invoice/${id}`, {
      responseType: 'blob'
    }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },
  downloadMultipleInvoices: (invoiceIds: string[]) => {
    return api.post('/api/pdf/invoices', { invoiceIds }, {
      responseType: 'blob'
    }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facturas-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },
};

export default api; 