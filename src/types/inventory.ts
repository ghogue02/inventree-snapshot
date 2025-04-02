
export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderPoint: number;
  cost: number;
  size?: string;
  image?: string;
}

export interface InventoryCount {
  id: string;
  productId: string;
  product?: Product;
  count: number;
  countedAt: Date;
  countMethod: 'manual' | 'video' | 'invoice' | 'camera';
  notes?: string;
}

export interface Invoice {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  date: Date;
  total: number;
  paidStatus: 'paid' | 'unpaid' | 'partial';
  items: InvoiceItem[];
  imageUrl?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InventoryRecognitionResult {
  productId: string;
  name: string;
  count: number;
  confidence: number;
  size?: string;
}

export interface InvoiceRecognitionResult {
  supplierName?: string;
  invoiceNumber?: string;
  date?: string;
  total?: number;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}
