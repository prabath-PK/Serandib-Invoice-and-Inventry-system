
export enum CustomerType {
  BUSINESS = 'Business',
  INDIVIDUAL = 'Individual'
}

export interface Customer {
  id: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  name: string; // Display Name
  companyName?: string;
  email: string;
  phone: string; // Work Phone
  mobile?: string;
  currency?: string;
  website?: string;
  receivables: number;
  unusedCredits: number;
  type: CustomerType;
  status?: 'Active' | 'Inactive';
  remarks?: string;
  paymentTerms?: string; // e.g., Due on Receipt, Net 15, Net 30
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  address: string;
  phone: string;
  mobile: string;
  email: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  stockQty: number;
  unit: string;
  cost: number;
  price: number;
  imageUrl?: string;
  supplier?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export interface InvoiceLineItem {
  itemId: string;
  name: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  subTotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
  balanceDue: number;
}

export interface Payment {
  id: string;
  date: string;
  paymentNumber: string;
  referenceNumber: string;
  customerName: string;
  invoiceNumbers: string[];
  mode: string; // Bank Transfer, Cash, etc.
  amount: number;
  unusedAmount: number;
  status: 'PAID' | 'PARTIAL' | 'VOID';
}

export type ViewState = 'HOME' | 'INVOICE' | 'PAYMENTS' | 'INVENTORY' | 'CUSTOMER' | 'REPORT';
