// Types pour les collections Firestore

// Type pour les clients (thirdParties)
export interface ThirdParty {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  notes?: string;
  code_client?: string; // Code client pour faire correspondre avec les factures
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Type pour les factures (invoices)
export interface Invoice {
  id: string;
  number: string;
  thirdPartyId: string;
  thirdPartyName: string;
  ref_client?: string; // Référence client pour faire correspondre avec les clients
  date: Date | string;
  dueDate: Date | string;
  date_validation?: Date | string | number; // Date de validation de la facture
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  multicurrency_total_ht?: number; // Montant HT
  multicurrency_total_ttc?: number; // Montant TTC
  notes?: string;
  fileUrl?: string;
  pdfUrl?: string; // URL du PDF de la facture
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Type pour les éléments de facture
export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
  total: number;
}

// Type pour les produits (products)
export interface Product {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  sku?: string;
  // Nouveaux champs spécifiques
  label?: string;
  ref?: string;
  stock_reel?: number;
  date_creation?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Type pour les utilisateurs
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'client';
  thirdPartyId?: string; // ID du client associé (si role = 'client')
  createdAt: Date | string;
  lastLogin?: Date | string;
  claims?: {
    role?: string;
    admin?: boolean;
    [key: string]: unknown;
  };
}

// Types pour les statistiques et KPIs
export interface DashboardStats {
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

// Type pour les filtres
export interface Filters {
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  search?: string;
}
