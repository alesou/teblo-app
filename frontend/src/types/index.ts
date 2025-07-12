export interface Client {
  id: string;
  name: string;
  nif?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
  vatRate: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  total: number;
  notes?: string;
  terms?: string;
  amountPaid?: number;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  companyName: string;
  companyNif?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyWeb?: string;
  invoicePrefix: string;
  nextNumber: number;
  terms?: string;
}

export interface CreateInvoiceData {
  clientId: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceData {
  date: string;
  dueDate?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
}

export interface CreateClientData {
  name: string;
  nif?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface UpdateClientData {
  name: string;
  nif?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface UpdateSettingsData {
  companyName: string;
  companyNif?: string;
  companyAddress?: string;
  invoicePrefix: string;
} 