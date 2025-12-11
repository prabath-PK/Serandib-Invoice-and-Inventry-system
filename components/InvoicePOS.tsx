
import React, { useState, useEffect } from 'react';
import { Customer, Invoice, InvoiceLineItem, InvoiceStatus, Item } from '../types';
import { CATEGORIES } from '../constants';
import { 
  Search, Plus, Minus, X, CreditCard, Banknote, 
  ArrowLeft, Printer, CheckCircle, FileText, 
  UserCircle, Calendar, Clock, MoreHorizontal,
  ChevronRight, Upload, Download, FileSpreadsheet, Settings, RefreshCw, Mail, Edit, Hash, DollarSign,
  Share2, Copy, Trash2
} from 'lucide-react';

interface InvoicePOSProps {
  customers: Customer[];
  items: Item[];
  invoices: Invoice[];
  onCreateInvoice: (invoice: Invoice) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  initialViewMode?: 'LIST' | 'CREATE';
}

type SortKey = 'date' | 'invoiceNumber';

const InvoicePOS: React.FC<InvoicePOSProps> = ({ 
    customers, items, invoices, onCreateInvoice, onUpdateInvoice,
    initialViewMode
}) => {
  // Navigation State
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST');
  
  // Selection State (Split View)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (initialViewMode) {
        setViewMode(initialViewMode);
        if (initialViewMode === 'CREATE') {
            handleOpenPOS();
        }
    }
  }, [initialViewMode]);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  
  // POS State
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null); // If null, new invoice
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<InvoiceLineItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');

  // ------------------------------------------------------------------
  // Helpers & Calculations
  // ------------------------------------------------------------------

  const filteredItems = items.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const filteredInvoices = invoices
    .filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (key === 'date') {
            return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction;
        } else {
            return a.invoiceNumber.localeCompare(b.invoiceNumber) * direction;
        }
    });

  const subTotal = cart.reduce((acc, item) => acc + item.amount, 0);
  const totalTax = subTotal * 0.10; // Mock 10% tax
  const totalDiscount = subTotal * 0.05; // Mock 5% discount
  const grandTotal = subTotal + totalTax - totalDiscount;

  // Initialize POS when switching to Create View
  const handleOpenPOS = (invoice?: Invoice) => {
    if (invoice) {
      // Edit Mode
      setCurrentInvoiceId(invoice.id);
      setSelectedCustomer(customers.find(c => c.id === invoice.customerId) || null);
      setInvoiceDate(invoice.date);
      setDueDate(invoice.dueDate);
      setCart(invoice.items);
    } else {
      // New Mode
      setCurrentInvoiceId(null);
      setSelectedCustomer(null);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setCart([]);
    }
    setSelectedInvoice(null); // Clear selection when entering edit mode to allow full screen
    setViewMode('CREATE');
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    setIsPaymentModalOpen(false);
  };

  const handleSort = (key: SortKey, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setIsMenuOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // ------------------------------------------------------------------
  // Cart Actions
  // ------------------------------------------------------------------

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        return prev.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1, amount: (i.quantity + 1) * i.rate } : i);
      }
      return [...prev, {
        itemId: item.id,
        name: item.name,
        quantity: 1,
        rate: item.price,
        discountPercent: 0,
        taxPercent: 0,
        amount: item.price
      }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.itemId === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty, amount: newQty * i.rate };
      }
      return i;
    }));
  };

  // ------------------------------------------------------------------
  // Invoice Actions
  // ------------------------------------------------------------------

  const constructInvoice = (status: InvoiceStatus): Invoice => {
    return {
      id: currentInvoiceId || Date.now().toString(),
      invoiceNumber: currentInvoiceId ? (invoices.find(i => i.id === currentInvoiceId)?.invoiceNumber || 'INV-UNKNOWN') : `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: selectedCustomer?.id || '0',
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      date: invoiceDate,
      dueDate: dueDate || invoiceDate,
      status: status,
      items: cart,
      subTotal,
      totalTax,
      totalDiscount,
      grandTotal,
      balanceDue: status === InvoiceStatus.PAID ? 0 : grandTotal
    };
  };

  const handleSaveHold = () => {
    const invoice = constructInvoice(InvoiceStatus.DRAFT);
    if (currentInvoiceId) {
      onUpdateInvoice(invoice);
    } else {
      onCreateInvoice(invoice);
    }
    handleBackToList();
  };

  const handlePaymentComplete = () => {
    const invoice = constructInvoice(InvoiceStatus.PAID);
    if (currentInvoiceId) {
      onUpdateInvoice(invoice);
    } else {
      onCreateInvoice(invoice);
    }
    handleBackToList();
  };

  // ------------------------------------------------------------------
  // Render: Invoice Overview (Split Pane)
  // ------------------------------------------------------------------
  const renderInvoiceOverview = (invoice: Invoice) => {
    const totalQty = invoice.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 animate-fade-in-right overflow-hidden">
            {/* Compact Header */}
            <div className="bg-white p-3 border-b border-gray-100 flex justify-between items-center flex-none print:hidden">
                <div className="flex items-center space-x-3">
                     <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        <FileText size={20} className="text-primary" />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-tight">{invoice.invoiceNumber}</h2>
                         <div className="flex items-center space-x-2 text-xs mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                ${invoice.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-700' : 
                                  invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-700' : 
                                  'bg-yellow-100 text-yellow-700'}
                            `}>
                                {invoice.status}
                            </span>
                            <span className="text-gray-400">| {invoice.date}</span>
                        </div>
                     </div>
                </div>
                <div className="flex items-center space-x-1">
                     <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Toolbar / Actions */}
            <div className="bg-white px-4 py-2 flex items-center space-x-1 border-b border-gray-100 flex-none overflow-x-auto print:hidden">
                <button onClick={() => handleOpenPOS(invoice)} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                    <Edit size={14} /> <span>Edit</span>
                </button>
                 <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                    <Mail size={14} /> <span>Send</span>
                </button>
                 <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                    <Share2 size={14} /> <span>Share</span>
                </button>
                 <button onClick={handlePrint} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                    <Printer size={14} /> <span>PDF/Print</span>
                </button>
                <div className="h-4 w-px bg-gray-200 mx-2 flex-none"></div>
                 <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                    <Copy size={14} /> <span>Clone</span>
                </button>
                 <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-red-50 text-sm font-medium text-gray-600 hover:text-red-600 transition whitespace-nowrap">
                    <Trash2 size={14} /> <span>Delete</span>
                </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
                 
                 {/* Actual Invoice Paper UI matching PDF */}
                 <div className="bg-white shadow-lg border border-gray-200 p-[40px] max-w-[210mm] mx-auto min-h-[297mm] relative text-[#333] font-sans print:shadow-none print:border-none print:w-full print:max-w-none print:min-h-0 print:p-10">
                      
                      {/* 1. Top Section */}
                      <div className="flex justify-between items-start mb-10">
                          {/* Logo Placeholder */}
                            <div className="w-40 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 font-bold tracking-widest text-xl">LOGO</span>
                            </div>

                          {/* Company Address */}
                          <div className="text-right text-xs leading-5 text-gray-600">
                                <h3 className="font-bold text-gray-800 text-sm uppercase mb-1">COMPANY NAME</h3>
                                <p>Address Line 1</p>
                                <p>City, Country</p>
                                <p>+00 000 000 000</p>
                                <p>email@example.com</p>
                          </div>
                      </div>

                      {/* 2. Invoice Title with Lines */}
                      <div className="flex items-center justify-center mb-12">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <h1 className="text-4xl text-sky-800 font-normal px-8 uppercase tracking-[0.2em]">INVOICE</h1>
                          <div className="flex-1 h-px bg-gray-300"></div>
                      </div>

                      {/* 3. Bill To & Invoice Meta Grid */}
                      <div className="flex justify-between items-start mb-12 gap-8">
                          {/* Bill To */}
                          <div className="w-[45%]">
                              <p className="text-gray-500 text-sm mb-3">Bill To</p>
                              <div className="text-sm text-gray-800 space-y-1">
                                  <p className="font-bold text-base">{invoice.customerName}</p>
                                  <p className="font-medium text-gray-700">Customer company</p>
                                  <p className="text-gray-600 leading-relaxed">
                                      {/* Mock address since it's not in the Invoice type fully or use placeholder */}
                                      Address
                                  </p>
                              </div>
                          </div>

                          {/* Meta Table */}
                          <div className="w-[45%]">
                              <div className="border border-gray-300 text-sm">
                                  <div className="flex border-b border-gray-300">
                                      <div className="w-1/2 bg-gray-50 p-2 text-gray-600 pl-3">Invoice#</div>
                                      <div className="w-1/2 p-2 pl-3 text-gray-800">{invoice.invoiceNumber}</div>
                                  </div>
                                  <div className="flex border-b border-gray-300">
                                      <div className="w-1/2 bg-gray-50 p-2 text-gray-600 pl-3">Invoice Date</div>
                                      <div className="w-1/2 p-2 pl-3 text-gray-800">{invoice.date}</div>
                                  </div>
                                  <div className="flex border-b border-gray-300">
                                      <div className="w-1/2 bg-gray-50 p-2 text-gray-600 pl-3">Terms</div>
                                      <div className="w-1/2 p-2 pl-3 text-gray-800">Due on Receipt</div>
                                  </div>
                                  <div className="flex">
                                      <div className="w-1/2 bg-gray-50 p-2 text-gray-600 pl-3">Due Date</div>
                                      <div className="w-1/2 p-2 pl-3 text-gray-800">{invoice.dueDate}</div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 4. Items Table */}
                      <table className="w-full mb-10 border border-gray-300">
                          <thead>
                              <tr className="bg-gray-100 text-gray-700 text-sm">
                                  <th className="border-r border-gray-300 py-3 px-3 font-medium text-center w-12">#</th>
                                  <th className="border-r border-gray-300 py-3 px-3 font-medium text-left">Item & Description</th>
                                  <th className="border-r border-gray-300 py-3 px-3 font-medium text-center w-20">Qty</th>
                                  <th className="border-r border-gray-300 py-3 px-3 font-medium text-right w-32">Rate</th>
                                  <th className="py-3 px-3 font-medium text-right w-32">Amount</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm text-gray-700">
                              {invoice.items.map((item, index) => (
                                  <tr key={index} className="border-t border-gray-300">
                                      <td className="border-r border-gray-300 py-3 px-3 text-center text-gray-500">{index + 1}</td>
                                      <td className="border-r border-gray-300 py-3 px-3 text-gray-800">{item.name}</td>
                                      <td className="border-r border-gray-300 py-3 px-3 text-center">{item.quantity}</td>
                                      <td className="border-r border-gray-300 py-3 px-3 text-right">{item.rate.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                      <td className="py-3 px-3 text-right text-gray-900">{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>

                      {/* 5. Bottom Section */}
                      <div className="flex justify-between items-start gap-12">
                          
                          {/* Left Column: Totals Summary & Bank Info */}
                          <div className="flex-1 space-y-8">
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Items in Total <span className="font-semibold text-gray-800">{totalQty}</span></p>
                                    <p>Thanks for your business.</p>
                                </div>
                                
                                {/* Total in words mock */}
                                <div className="text-sm">
                                    <span className="text-gray-600 italic mr-2">Total In Words:</span>
                                    <span className="font-semibold text-gray-800">One Hundred Twenty Thousand</span>
                                </div>

                                {/* Bank Details */}
                                <div className="border-t-2 border-gray-800 pt-3 text-sm text-gray-800 max-w-xs">
                                    <p className="font-bold mb-1">Bank Transfer</p>
                                    <p className="mb-0.5"><span className="font-bold">Acc # 000000000</span> : Bank Name</p>
                                    <p><span className="font-bold">Acc # 000000000</span> : Bank Name</p>
                                </div>
                          </div>

                          {/* Right Column: Financial Totals */}
                          <div className="w-[45%]">
                              <div className="space-y-0 text-sm">
                                  <div className="flex justify-between py-2 border-b border-gray-200">
                                      <span className="text-gray-600 font-medium">Sub Total</span>
                                      <span className="text-gray-800 font-bold">{invoice.subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-gray-200">
                                      <span className="text-gray-600 font-medium">Tax (10%)</span>
                                      <span className="text-gray-800">{invoice.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-gray-200 text-green-600">
                                      <span className="font-medium">Discount (5%)</span>
                                      <span>(-) {invoice.totalDiscount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-gray-200 bg-gray-50 px-2 -mx-2">
                                      <span className="text-gray-800 font-bold">Total</span>
                                      <span className="text-gray-800 font-bold">LKR {invoice.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-gray-200 text-red-500">
                                      <span className="font-medium">Payment Made</span>
                                      <span className="font-bold">(-) {(invoice.grandTotal - invoice.balanceDue).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                  </div>
                                  <div className="flex justify-between py-3">
                                      <span className="text-sky-700 font-bold text-base">Balance Due</span>
                                      <span className="text-sky-700 font-bold text-base">LKR {invoice.balanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 6. Footer */}
                      <div className="absolute bottom-10 left-0 right-0 text-center">
                           <div className="mx-16 pt-4 border-t border-gray-200 text-xs text-sky-600 font-medium tracking-wide">
                                COMPANY NAME | Address | City | Country | +00 000 000 000 | www.company.com
                           </div>
                      </div>
                 </div>
            </div>
        </div>
    );
  }

  // ------------------------------------------------------------------
  // Render: Payment Modal
  // ------------------------------------------------------------------

  const renderPaymentModal = () => {
    if (!isPaymentModalOpen) return null;

    const cashReceivedNum = parseFloat(cashReceived) || 0;
    const change = cashReceivedNum - grandTotal;
    const isCashSufficient = cashReceivedNum >= grandTotal;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in print:hidden">
        <div className="bg-white w-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 text-white p-6 flex justify-between items-center">
            <h3 className="text-xl font-bold">Payment Details</h3>
            <button onClick={() => setIsPaymentModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="text-center mb-6">
               <p className="text-gray-500 text-sm uppercase font-semibold mb-1">Total Amount Due</p>
               <p className="text-4xl font-bold text-gray-800">LKR {grandTotal.toLocaleString()}</p>
            </div>

            {/* Payment Method Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setPaymentMethod('CASH')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-bold transition
                  ${paymentMethod === 'CASH' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <Banknote size={18} />
                <span>CASH</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('CARD')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-bold transition
                  ${paymentMethod === 'CARD' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <CreditCard size={18} />
                <span>CARD</span>
              </button>
            </div>

            {/* Dynamic Content */}
            {paymentMethod === 'CASH' ? (
              <div className="space-y-4 animate-fade-in-up">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cash Received</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">LKR</span>
                      <input 
                        type="number"
                        autoFocus
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-14 pr-4 py-4 text-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
                        placeholder="0.00"
                      />
                   </div>
                </div>
                <div className={`p-4 rounded-xl flex justify-between items-center transition
                   ${change >= 0 ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}
                `}>
                   <span className={`text-sm font-bold uppercase ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change >= 0 ? 'Change to Return' : 'Amount Due'}
                   </span>
                   <span className={`text-xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 animate-fade-in-up">
                 <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={32} />
                 </div>
                 <h4 className="font-bold text-gray-800 mb-2">Process on Terminal</h4>
                 <p className="text-sm text-gray-500">Please complete the transaction on the card terminal and confirm below.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium">
               <Printer size={18} />
               <span>Print Bill</span>
            </button>
            <div className="flex space-x-3">
               <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
               >
                  Cancel
               </button>
               <button 
                  onClick={handlePaymentComplete}
                  disabled={paymentMethod === 'CASH' && !isCashSufficient}
                  className={`px-8 py-3 rounded-xl font-bold text-white flex items-center space-x-2 shadow-lg transition
                     ${(paymentMethod === 'CASH' && !isCashSufficient) 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform active:scale-95'}
                  `}
               >
                  <CheckCircle size={20} />
                  <span>Complete Order</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // View: List
  // ------------------------------------------------------------------

  if (viewMode === 'LIST') {
    return (
      <div className="flex h-full gap-6 relative" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
        
        {/* LEFT PANE: Header + List Container */}
        <div className={`flex flex-col h-full transition-all duration-300 ease-in-out gap-4 print:hidden
            ${selectedInvoice ? 'w-[30%] min-w-[320px]' : 'w-full'}
        `}>
            {/* Header - Now inside the left pane so layout allows full vertical height for right pane */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center z-20 relative flex-none">
                <div className={`${selectedInvoice ? 'hidden xl:block' : 'block'}`}>
                    <h2 className="text-xl font-bold text-gray-800">Invoices</h2>
                    <p className={`text-sm text-gray-500 ${selectedInvoice ? 'hidden' : 'block'}`}>Manage sales</p>
                </div>
                <div className="flex items-center space-x-2 flex-1 justify-end">
                    {/* Compact Search & Actions when split view is active */}
                    <div className="relative flex-1 max-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..." 
                            className="w-full pl-9 pr-3 py-2 bg-gray-800 text-white placeholder-gray-400 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    
                    <button 
                        onClick={() => handleOpenPOS()}
                        className="bg-primary hover:bg-sky-700 text-white p-2 px-3 rounded-lg flex items-center justify-center transition shadow-md whitespace-nowrap"
                        title="New Invoice"
                    >
                        <Plus size={20} />
                        <span className={`${selectedInvoice ? 'hidden' : 'ml-2 block'}`}>New</span>
                    </button>
                    
                    {/* Options Menu */}
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className={`p-2 rounded-lg transition ${isMenuOpen ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-100 py-2 animate-fade-in text-sm" onClick={(e) => e.stopPropagation()}>
                                {/* Sort By Submenu */}
                                <div className="relative group">
                                <button className="w-full text-left px-4 py-2 bg-blue-500 text-white flex justify-between items-center hover:bg-blue-600 transition">
                                    <span className="font-medium">Sort by</span>
                                    <ChevronRight size={14} />
                                </button>
                                <div className="absolute right-full top-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block py-1 mr-1">
                                    <button onClick={() => handleSort('date', 'desc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Date (Newest First)</button>
                                    <button onClick={() => handleSort('date', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Date (Oldest First)</button>
                                    <button onClick={() => handleSort('invoiceNumber', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Invoice Number</button>
                                </div>
                                </div>

                                <div className="border-t my-1"></div>

                                {/* Import/Export Submenus */}
                                {['Import', 'Export'].map((action) => (
                                    <div key={action} className="relative group">
                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center text-gray-700">
                                            <div className="flex items-center space-x-2">
                                                {action === 'Import' ? <Upload size={14} /> : <Download size={14} />}
                                                <span>{action}</span>
                                            </div>
                                            <ChevronRight size={14} />
                                        </button>
                                        <div className="absolute right-full top-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block py-1 mr-1">
                                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2">
                                                <FileText size={14} /> <span>CSV File (.csv)</span>
                                            </button>
                                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2">
                                                <FileSpreadsheet size={14} /> <span>Excel File (.xls)</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="border-t my-1"></div>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2">
                                    <Settings size={14} /> <span>Preferences</span>
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2">
                                    <RefreshCw size={14} /> <span>Refresh List</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col border border-gray-100">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0 z-10 border-b">
                            <tr>
                                <th className={`px-6 py-4 font-semibold ${selectedInvoice ? 'w-[40%]' : 'w-[15%]'}`}>Date</th>
                                <th className={`px-6 py-4 font-semibold ${selectedInvoice ? 'w-[40%]' : 'w-[15%]'}`}>Invoice #</th>
                                <th className={`px-6 py-4 font-semibold ${selectedInvoice ? 'hidden' : 'w-[20%]'}`}>Customer</th>
                                <th className={`px-6 py-4 font-semibold text-center ${selectedInvoice ? 'w-[20%]' : 'w-[10%]'}`}>Status</th>
                                <th className={`px-6 py-4 font-semibold text-right ${selectedInvoice ? 'hidden' : 'w-[15%]'}`}>Amount</th>
                                <th className={`px-6 py-4 font-semibold text-right ${selectedInvoice ? 'hidden' : 'w-[15%]'}`}>Balance</th>
                                <th className={`px-6 py-4 font-semibold text-center ${selectedInvoice ? 'hidden' : 'w-[10%]'}`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredInvoices.map((inv) => (
                            <tr 
                                key={inv.id} 
                                onClick={() => setSelectedInvoice(inv)}
                                className={`transition cursor-pointer group
                                    ${selectedInvoice?.id === inv.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-sky-50 border-l-4 border-transparent'}
                                `}
                            >
                                <td className="px-6 py-4 text-gray-600 font-medium truncate">
                                    {inv.date}
                                </td>
                                <td className="px-6 py-4 text-gray-800 font-bold truncate">{inv.invoiceNumber}</td>
                                <td className={`px-6 py-4 text-gray-700 truncate ${selectedInvoice ? 'hidden' : ''}`}>{inv.customerName}</td>
                                <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                    ${inv.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-700' : 
                                    inv.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-700' : 
                                    inv.status === InvoiceStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {inv.status === InvoiceStatus.PAID ? 'Paid' : inv.status.substring(0,4)}
                                </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-medium text-gray-800 ${selectedInvoice ? 'hidden' : ''}`}>LKR {inv.grandTotal.toLocaleString()}</td>
                                <td className={`px-6 py-4 text-right text-gray-500 font-mono ${selectedInvoice ? 'hidden' : ''}`}>
                                    {inv.balanceDue > 0 ? `LKR ${inv.balanceDue.toLocaleString()}` : '-'}
                                </td>
                                <td className={`px-6 py-4 text-center ${selectedInvoice ? 'hidden' : ''}`}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleOpenPOS(inv); }}
                                        className="text-primary hover:bg-blue-50 p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* RIGHT PANE: Overview (Independent Height) */}
        {selectedInvoice && (
             <div className="w-[70%] h-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col animate-fade-in-right overflow-hidden relative z-30 print:w-full print:fixed print:inset-0 print:z-[100] print:h-screen print:bg-white print:border-none print:shadow-none">
                {renderInvoiceOverview(selectedInvoice)}
             </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // View: POS / Create
  // ------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* POS Top Bar */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={handleBackToList}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition"
        >
           <ArrowLeft size={18} />
           <span className="font-bold text-sm">Back to List</span>
        </button>
        <div className="bg-white px-6 py-2 rounded-lg shadow-sm border-l-4 border-primary">
           <span className="text-xs text-gray-400 uppercase font-bold mr-2">
              {currentInvoiceId ? 'Editing Invoice' : 'Creating New Invoice'}
           </span>
           <span className="font-bold text-gray-800">
              {currentInvoiceId ? invoices.find(i => i.id === currentInvoiceId)?.invoiceNumber : 'DRAFT'}
           </span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Panel: Invoice Details & Item Selection */}
        <div className="w-[55%] flex flex-col space-y-4">
          
          {/* Invoice Header Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-start">
               {/* Customer Select */}
               <div className="flex-1 mr-4">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Customer</label>
                 <div className="relative">
                    <select 
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-10 pr-4 py-2.5 appearance-none focus:ring-2 focus:ring-primary/50 focus:outline-none transition"
                        value={selectedCustomer?.id || ''}
                        onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                    >
                        <option value="">Walk-in Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <UserCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 </div>
               </div>

               {/* Dates */}
               <div className="flex space-x-3">
                  <div className="w-36">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date</label>
                     <div className="relative">
                        <input 
                            type="date" 
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-9 pr-2 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                        />
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     </div>
                  </div>
                  <div className="w-36">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Due Date</label>
                     <div className="relative">
                        <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-9 pr-2 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                        />
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Item Selection Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
              {/* Category Tabs */}
              <div className="px-4 pt-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                          <button 
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition border
                                  ${selectedCategory === cat 
                                      ? 'bg-gray-800 text-white border-gray-800' 
                                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                              `}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative mt-3">
                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                        type="text" 
                        placeholder="Search items..." 
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                     />
                  </div>
              </div>

              {/* Item Grid */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredItems.map(item => (
                          <button 
                              key={item.id}
                              onClick={() => addToCart(item)}
                              className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition flex flex-col items-center text-center group h-32 justify-between relative overflow-hidden"
                          >
                              <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                              <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition text-primary">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    <span className="font-bold text-xs">{item.sku.substring(0,2)}</span>
                                  )}
                              </div>
                              <div className="w-full">
                                  <p className="text-xs font-bold text-gray-700 line-clamp-1 group-hover:text-primary transition">{item.name}</p>
                                  <p className="text-xs text-gray-500 mt-1 font-mono">LKR {item.price}</p>
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>

        </div>

        {/* Right Panel: Line Items & Totals */}
        <div className="w-[45%] flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md z-10">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                 <FileText size={20} />
                 <span>Current Order</span>
              </h3>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b shadow-sm">
              <div className="col-span-5 pl-2">Item</div>
              <div className="col-span-3 text-center">Qty</div>
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-1"></div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <div className="p-6 bg-gray-50 rounded-full mb-4 animate-pulse"><Search size={48}/></div>
                      <p className="font-medium">No items in cart</p>
                      <p className="text-sm">Select products from the left to start</p>
                  </div>
              ) : (
                  cart.map(item => (
                      <div key={item.itemId} className="grid grid-cols-12 gap-2 p-3 border-b border-gray-50 hover:bg-sky-50/50 transition items-center text-sm group">
                          <div className="col-span-5 font-semibold text-gray-700 pl-2">
                              {item.name}
                          </div>
                          <div className="col-span-3 flex justify-center items-center space-x-2">
                              <button 
                                onClick={() => updateQuantity(item.itemId, -1)} 
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200 hover:text-red-500 transition"
                              >
                                <Minus size={12}/>
                              </button>
                              <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.itemId, 1)} 
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200 hover:text-green-500 transition"
                              >
                                <Plus size={12}/>
                              </button>
                          </div>
                          <div className="col-span-3 text-right font-medium text-gray-800">
                              {item.amount.toLocaleString()}
                          </div>
                          <div className="col-span-1 flex justify-end pr-2">
                              <button onClick={() => removeFromCart(item.itemId)} className="text-gray-300 hover:text-red-500 transition">
                                <X size={16}/>
                              </button>
                          </div>
                      </div>
                  ))
              )}
          </div>

          {/* Footer Totals */}
          <div className="bg-gray-50 p-6 border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 space-y-3">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                    <span className="font-medium">Sub Total</span>
                    <span className="font-bold">LKR {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span className="font-medium">Tax (10%)</span>
                    <span>LKR {totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                    <span className="font-medium">Discount (5%)</span>
                    <span>- LKR {totalDiscount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 mb-2">
                  <span className="text-gray-500 font-bold uppercase text-xs">Total Outstanding</span>
                  <span className="text-2xl font-black text-gray-800">LKR {grandTotal.toLocaleString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-3 pt-2">
                  <button 
                    onClick={handleBackToList}
                    className="col-span-1 bg-red-50 text-red-600 border border-red-200 py-3 rounded-lg font-bold hover:bg-red-100 transition uppercase text-xs flex flex-col items-center justify-center gap-1"
                  >
                      <span>Cancel</span>
                  </button>
                  <button 
                    onClick={handleSaveHold}
                    className="col-span-1 bg-yellow-50 text-yellow-700 border border-yellow-200 py-3 rounded-lg font-bold hover:bg-yellow-100 transition uppercase text-xs flex flex-col items-center justify-center gap-1"
                  >
                      <span>Hold</span>
                  </button>
                  <button 
                    onClick={() => {
                        setCashReceived('');
                        setIsPaymentModalOpen(true);
                    }}
                    disabled={cart.length === 0}
                    className={`col-span-2 flex items-center justify-center space-x-2 text-white border py-3 rounded-lg font-bold transition uppercase text-sm shadow-md
                        ${cart.length === 0 ? 'bg-gray-400 border-gray-400 cursor-not-allowed' : 'bg-green-600 border-green-600 hover:bg-green-700 hover:shadow-lg transform active:scale-95'}
                    `}
                  >
                      <CheckCircle size={20} />
                      <span>Process Payment</span>
                  </button>
              </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal Overlay */}
      {renderPaymentModal()}
    </div>
  );
};

export default InvoicePOS;
