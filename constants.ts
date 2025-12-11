
import { Customer, CustomerType, Invoice, InvoiceStatus, Item, Payment, Supplier } from './types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'TechFlow Solutions',
    salutation: 'Mr.',
    firstName: 'David',
    lastName: 'Miller',
    companyName: 'TechFlow Solutions',
    email: 'david@techflow.com',
    phone: '+1 555-0101',
    mobile: '+1 555-0102',
    currency: 'LKR',
    type: CustomerType.BUSINESS,
    status: 'Active',
    receivables: 150000,
    unusedCredits: 5000,
    paymentTerms: 'Net 30'
  },
  {
    id: 'cust_2',
    name: 'GreenLeaf Organics',
    salutation: 'Ms.',
    firstName: 'Sarah',
    lastName: 'Connor',
    companyName: 'GreenLeaf Organics',
    email: 'sarah@greenleaf.com',
    phone: '+1 555-0201',
    mobile: '',
    currency: 'USD',
    type: CustomerType.BUSINESS,
    status: 'Active',
    receivables: 45000,
    unusedCredits: 0,
    paymentTerms: 'Due on Receipt'
  },
  {
    id: 'cust_3',
    name: 'Alex Johnson',
    salutation: 'Mr.',
    firstName: 'Alex',
    lastName: 'Johnson',
    companyName: '',
    email: 'alex.j@email.com',
    phone: '+1 555-0301',
    mobile: '+1 555-0302',
    currency: 'LKR',
    type: CustomerType.INDIVIDUAL,
    status: 'Active',
    receivables: 0,
    unusedCredits: 0,
    paymentTerms: 'Due on Receipt'
  },
  {
    id: 'cust_4',
    name: 'Apex Construction',
    salutation: 'Mr.',
    firstName: 'Robert',
    lastName: 'Stone',
    companyName: 'Apex Construction Ltd',
    email: 'accounts@apexconst.com',
    phone: '+1 555-0401',
    mobile: '',
    currency: 'LKR',
    type: CustomerType.BUSINESS,
    status: 'Active',
    receivables: 250000,
    unusedCredits: 12000,
    paymentTerms: 'Net 15'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp_1',
    name: 'Global Electronics Ltd',
    contactPerson: 'James Wu',
    address: '45 Tech Park, Silicon Valley',
    phone: '+1 888-0001',
    mobile: '+1 888-0002',
    email: 'sales@globalelectronics.com'
  },
  {
    id: 'supp_2',
    name: 'Office Depot Wholesale',
    contactPerson: 'Linda Martinez',
    address: '100 Main St, Business City',
    phone: '+1 888-1111',
    mobile: '',
    email: 'support@officedepot.com'
  },
  {
    id: 'supp_3',
    name: 'Fresh Harvest Co',
    contactPerson: 'Tom Baker',
    address: '22 Farm Road, Countryside',
    phone: '+1 888-2222',
    mobile: '+1 888-2223',
    email: 'orders@freshharvest.com'
  }
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item_1',
    sku: 'HW-LPT-001',
    name: 'ProBook Laptop 15"',
    description: 'High performance laptop for professionals',
    category: 'Electronics',
    stockQty: 25,
    unit: 'Unit',
    cost: 120000,
    price: 155000,
    supplier: 'Global Electronics Ltd'
  },
  {
    id: 'item_2',
    sku: 'HW-MSE-002',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless optical mouse',
    category: 'Electronics',
    stockQty: 150,
    unit: 'Unit',
    cost: 1500,
    price: 3500,
    supplier: 'Global Electronics Ltd'
  },
  {
    id: 'item_3',
    sku: 'OFF-PPR-001',
    name: 'A4 Paper Ream',
    description: '500 sheets, 80gsm white paper',
    category: 'Stationery',
    stockQty: 500,
    unit: 'Pack',
    cost: 850,
    price: 1250,
    supplier: 'Office Depot Wholesale'
  },
  {
    id: 'item_4',
    sku: 'SVC-WEB-001',
    name: 'Web Design Basic',
    description: '5 Page Static Website Design',
    category: 'Services',
    stockQty: 999,
    unit: 'Hour',
    cost: 0,
    price: 50000,
    supplier: ''
  },
  {
    id: 'item_5',
    sku: 'FD-COF-001',
    name: 'Premium Coffee Beans',
    description: '1kg bag of Arabica beans',
    category: 'Beverage',
    stockQty: 40,
    unit: 'Kg',
    cost: 3500,
    price: 5800,
    supplier: 'Fresh Harvest Co'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2025-001',
    customerId: 'cust_1',
    customerName: 'TechFlow Solutions',
    date: '2025-01-15',
    dueDate: '2025-02-15',
    status: InvoiceStatus.PAID,
    items: [
      { itemId: 'item_1', name: 'ProBook Laptop 15"', quantity: 2, rate: 155000, discountPercent: 0, taxPercent: 0, amount: 310000 },
      { itemId: 'item_2', name: 'Wireless Mouse', quantity: 2, rate: 3500, discountPercent: 0, taxPercent: 0, amount: 7000 }
    ],
    subTotal: 317000,
    totalTax: 31700,
    totalDiscount: 0,
    grandTotal: 348700,
    balanceDue: 0
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2025-002',
    customerId: 'cust_2',
    customerName: 'GreenLeaf Organics',
    date: '2025-02-01',
    dueDate: '2025-02-01',
    status: InvoiceStatus.OVERDUE,
    items: [
      { itemId: 'item_4', name: 'Web Design Basic', quantity: 1, rate: 50000, discountPercent: 0, taxPercent: 0, amount: 50000 }
    ],
    subTotal: 50000,
    totalTax: 5000,
    totalDiscount: 0,
    grandTotal: 55000,
    balanceDue: 55000
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2025-003',
    customerId: 'cust_4',
    customerName: 'Apex Construction',
    date: '2025-02-10',
    dueDate: '2025-02-25',
    status: InvoiceStatus.PENDING,
    items: [
      { itemId: 'item_3', name: 'A4 Paper Ream', quantity: 50, rate: 1250, discountPercent: 5, taxPercent: 0, amount: 59375 }
    ],
    subTotal: 59375,
    totalTax: 5937.5,
    totalDiscount: 2968.75,
    grandTotal: 62343.75,
    balanceDue: 62343.75
  },
  {
    id: 'inv_4',
    invoiceNumber: 'INV-2025-004',
    customerId: 'cust_3',
    customerName: 'Alex Johnson',
    date: '2025-02-12',
    dueDate: '2025-02-12',
    status: InvoiceStatus.PAID,
    items: [
      { itemId: 'item_5', name: 'Premium Coffee Beans', quantity: 2, rate: 5800, discountPercent: 0, taxPercent: 0, amount: 11600 }
    ],
    subTotal: 11600,
    totalTax: 1160,
    totalDiscount: 0,
    grandTotal: 12760,
    balanceDue: 0
  },
  {
    id: 'inv_5',
    invoiceNumber: 'INV-2025-005',
    customerId: 'cust_1',
    customerName: 'TechFlow Solutions',
    date: '2025-02-20',
    dueDate: '2025-03-20',
    status: InvoiceStatus.PENDING,
    items: [
      { itemId: 'item_2', name: 'Wireless Mouse', quantity: 10, rate: 3500, discountPercent: 10, taxPercent: 0, amount: 31500 }
    ],
    subTotal: 31500,
    totalTax: 3150,
    totalDiscount: 3150,
    grandTotal: 31500,
    balanceDue: 15000 // Partial payment made
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
    {
        id: 'pay_1',
        date: '2025-01-20',
        paymentNumber: 'PAY-001',
        referenceNumber: 'TRX-998877',
        customerName: 'TechFlow Solutions',
        invoiceNumbers: ['INV-2025-001'],
        mode: 'Bank Transfer',
        amount: 348700.00,
        unusedAmount: 0.00,
        status: 'PAID'
    },
    {
        id: 'pay_2',
        date: '2025-02-12',
        paymentNumber: 'PAY-002',
        referenceNumber: 'CASH',
        customerName: 'Alex Johnson',
        invoiceNumbers: ['INV-2025-004'],
        mode: 'Cash',
        amount: 12760.00,
        unusedAmount: 0.00,
        status: 'PAID'
    },
    {
        id: 'pay_3',
        date: '2025-02-22',
        paymentNumber: 'PAY-003',
        referenceNumber: 'CHQ-45561',
        customerName: 'TechFlow Solutions',
        invoiceNumbers: ['INV-2025-005'],
        mode: 'Cheque',
        amount: 16500.00,
        unusedAmount: 0.00,
        status: 'PAID' // Partial payment
    },
    {
        id: 'pay_4',
        date: '2025-02-15',
        paymentNumber: 'PAY-004',
        referenceNumber: 'TRX-112233',
        customerName: 'Apex Construction',
        invoiceNumbers: [],
        mode: 'Bank Transfer',
        amount: 50000.00,
        unusedAmount: 50000.00,
        status: 'PAID' // Advance payment
    },
    {
        id: 'pay_5',
        date: '2025-02-18',
        paymentNumber: 'PAY-005',
        referenceNumber: 'CASH',
        customerName: 'Local Customer',
        invoiceNumbers: [],
        mode: 'Cash',
        amount: 2500.00,
        unusedAmount: 0.00,
        status: 'PAID'
    },
    {
        id: 'pay_6',
        date: '2025-02-25',
        paymentNumber: 'PAY-006',
        referenceNumber: 'TRX-445566',
        customerName: 'TechFlow Solutions',
        invoiceNumbers: ['INV-2025-001'], // Duplicate ref for history
        mode: 'Bank Transfer',
        amount: 10000.00,
        unusedAmount: 10000.00,
        status: 'PAID'
    },
    {
        id: 'pay_7',
        date: '2025-02-26',
        paymentNumber: 'PAY-007',
        referenceNumber: 'CARD-1234',
        customerName: 'Walk-in Customer',
        invoiceNumbers: [],
        mode: 'Credit Card',
        amount: 15400.00,
        unusedAmount: 0.00,
        status: 'PAID'
    }
];

export const CATEGORIES = ['All', 'Electronics', 'Stationery', 'Beverage', 'Services', 'Furniture'];

export const CHART_DATA = [
    { name: 'Sep', Sales: 150000, Cost: 100000, Profit: 50000 },
    { name: 'Oct', Sales: 230000, Cost: 160000, Profit: 70000 },
    { name: 'Nov', Sales: 180000, Cost: 120000, Profit: 60000 },
    { name: 'Dec', Sales: 320000, Cost: 210000, Profit: 110000 },
    { name: 'Jan', Sales: 250000, Cost: 175000, Profit: 75000 },
    { name: 'Feb', Sales: 410000, Cost: 280000, Profit: 130000 },
];
