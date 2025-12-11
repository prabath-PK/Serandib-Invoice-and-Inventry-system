
import React, { useState, useEffect } from 'react';
import { Customer, CustomerType, Invoice } from '../types';
import { Plus, MoreHorizontal, Search, Mail, Phone, Building2, ChevronRight, FileSpreadsheet, FileText, Settings, RefreshCw, Upload, Download, X, History, Edit, Calendar, Info, ArrowLeft, Smartphone, Globe, CreditCard, Receipt, FileBarChart, Copy, Trash2 } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  invoices: Invoice[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, invoices, onAddCustomer, onUpdateCustomer }) => {
  // View State: 'LIST' or 'CREATE'
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST');

  // Main List State
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  // Selection State (Split View)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'STATEMENT'>('OVERVIEW');

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    type: CustomerType.BUSINESS,
    status: 'Active',
    salutation: 'Mr.',
    firstName: '',
    lastName: '',
    name: '', // Display Name
    email: '',
    phone: '',
    mobile: '',
    companyName: '',
    currency: 'LKR',
    remarks: '',
    paymentTerms: 'Due on Receipt'
  });

  const [formTab, setFormTab] = useState('OTHER');

  // Helper to reset form
  const resetForm = () => {
    setFormData({
      type: CustomerType.BUSINESS,
      status: 'Active',
      salutation: 'Mr.',
      firstName: '',
      lastName: '',
      name: '',
      email: '',
      phone: '',
      mobile: '',
      companyName: '',
      currency: 'LKR',
      remarks: '',
      paymentTerms: 'Due on Receipt'
    });
    setFormTab('OTHER');
  };

  const handleOpenNewPage = () => {
    resetForm();
    setSelectedCustomer(null); // Clear selection to show full list behind or transition cleanly
    setViewMode('CREATE');
  };

  const handleEditFromOverview = () => {
    if (selectedCustomer) {
        setFormData(selectedCustomer);
        // We keep selectedCustomer set so if they cancel, they go back to the split view
        setViewMode('CREATE'); 
    }
  }

  const handleCloneCustomer = () => {
    if (selectedCustomer) {
        const { id, ...rest } = selectedCustomer;
        setFormData({ ...rest, name: `${rest.name} (Copy)` });
        setViewMode('CREATE');
    }
  }

  // Filter & Sort Logic
  const filteredCustomers = customers
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[sortConfig.key] || '').toString().toLowerCase();
      const valB = (b[sortConfig.key] || '').toString().toLowerCase();
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return; // Display Name is required

    const customerData: Customer = {
      id: formData.id || Date.now().toString(),
      name: formData.name, // Display Name
      firstName: formData.firstName,
      lastName: formData.lastName,
      salutation: formData.salutation,
      companyName: formData.companyName,
      email: formData.email || '',
      phone: formData.phone || '',
      mobile: formData.mobile || '',
      type: formData.type as CustomerType,
      status: formData.status as 'Active' | 'Inactive' || 'Active',
      currency: formData.currency || 'LKR',
      remarks: formData.remarks || '',
      receivables: formData.receivables || 0,
      unusedCredits: formData.unusedCredits || 0,
      paymentTerms: formData.paymentTerms || 'Due on Receipt'
    };

    if (viewMode === 'CREATE') {
        if (formData.id) {
            onUpdateCustomer(customerData);
            // Update selected customer to reflect changes immediately in split view
            if (selectedCustomer && selectedCustomer.id === customerData.id) {
                setSelectedCustomer(customerData);
            }
        } else {
            onAddCustomer(customerData);
        }
        setViewMode('LIST');
    }
  };

  const handleSort = (key: keyof Customer, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setIsMenuOpen(false);
  };

  // ------------------------------------------------------------------
  // Detailed Form Component (Used in Create/Edit Page)
  // ------------------------------------------------------------------
  const renderCustomerForm = () => (
    <div className="w-full">
        {/* Basic Info Section */}
        <div className="space-y-6 max-w-4xl">
            
            {/* Customer Type */}
            <div className="flex items-start">
                <label className="text-sm font-medium text-gray-600 w-48 pt-1">
                    Customer Type <Info size={14} className="inline text-gray-400 ml-1"/>
                </label>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="type" 
                            checked={formData.type === CustomerType.BUSINESS}
                            onChange={() => setFormData({...formData, type: CustomerType.BUSINESS})}
                            className="text-primary focus:ring-primary w-4 h-4" 
                        />
                        <span className="text-sm text-gray-700">Business</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="type" 
                            checked={formData.type === CustomerType.INDIVIDUAL}
                            onChange={() => setFormData({...formData, type: CustomerType.INDIVIDUAL})}
                            className="text-primary focus:ring-primary w-4 h-4" 
                        />
                        <span className="text-sm text-gray-700">Individual</span>
                    </label>
                </div>
            </div>

            {/* Primary Contact */}
            <div className="flex items-center">
                <label className="text-sm font-medium text-gray-600 w-48">
                    Primary Contact <Info size={14} className="inline text-gray-400 ml-1"/>
                </label>
                <div className="flex flex-1 space-x-3">
                    <div className="w-24">
                         <select 
                            value={formData.salutation}
                            onChange={(e) => setFormData({...formData, salutation: e.target.value})}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7] placeholder-gray-400"
                        >
                            <option>Mr.</option>
                            <option>Ms.</option>
                            <option>Mrs.</option>
                            <option>Dr.</option>
                        </select>
                    </div>
                    <input 
                        type="text" 
                        placeholder="First Name" 
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                     <input 
                        type="text" 
                        placeholder="Last Name" 
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                </div>
            </div>

            {/* Company Name */}
            <div className="flex items-center">
                <label className="text-sm font-medium text-gray-600 w-48">Company Name</label>
                <input 
                    type="text" 
                    className="flex-1 max-w-lg border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
            </div>

            {/* Display Name */}
            <div className="flex items-center">
                <label className="text-sm font-medium text-red-500 w-48">
                    Display Name* <Info size={14} className="inline text-gray-400 ml-1"/>
                </label>
                <input 
                    type="text" 
                    required
                    className="flex-1 max-w-lg border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Name to appear on invoices"
                />
            </div>

            {/* Currency */}
            <div className="flex items-start">
                <label className="text-sm font-medium text-gray-600 w-48 pt-2">Currency</label>
                <div className="flex-1 max-w-lg">
                    <select 
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7] text-gray-600"
                        disabled // Disabled as per screenshot implication "cannot be edited"
                    >
                        <option value="LKR">LKR - Sri Lankan Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                    </select>
                     <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                        <Info size={12} className="mt-0.5 flex-none"/> 
                        <span>Currency cannot be edited as multi-currency handling is unavailable in this version.</span>
                    </p>
                </div>
            </div>

            {/* Payment Terms */}
            <div className="flex items-center">
                <label className="text-sm font-medium text-gray-600 w-48">Payment Terms</label>
                <select 
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                    className="flex-1 max-w-lg border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                >
                    <option>Due on Receipt</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                </select>
            </div>

            {/* Email Address */}
            <div className="flex items-center">
                <label className="text-sm font-medium text-gray-600 w-48">
                    Email Address <Info size={14} className="inline text-gray-400 ml-1"/>
                </label>
                <input 
                    type="email" 
                    className="flex-1 max-w-lg border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
            </div>

            {/* Phone */}
            <div className="flex items-center">
                <label className="text-sm font-medium text-gray-600 w-48">
                    Phone <Info size={14} className="inline text-gray-400 ml-1"/>
                </label>
                <div className="flex flex-1 max-w-lg space-x-3">
                    <div className="flex-1 relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="tel" 
                            placeholder="Work Phone"
                            className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                     <div className="flex-1 relative">
                        <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="tel" 
                            placeholder="Mobile"
                            className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        />
                    </div>
                </div>
            </div>

             {/* Customer Language */}
             <div className="flex items-center">
                <label className="text-sm font-medium text-gray-600 w-48">
                    Customer Language <Info size={14} className="inline text-gray-400 ml-1"/>
                </label>
                <select className="flex-1 max-w-lg border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]">
                    <option>English</option>
                </select>
            </div>
        </div>
        
        {/* Tabs Section */}
        <div className="mt-10">
            <div className="flex space-x-6 border-b border-gray-200 mb-6">
                {['Other Details', 'Remarks'].map((tab) => {
                    const tabKey = tab.split(' ')[0].toUpperCase();
                    return (
                        <button 
                            key={tab}
                            type="button" // Prevent submit
                            onClick={() => setFormTab(tabKey)}
                            className={`pb-2 text-sm font-medium transition border-b-2 
                                ${formTab === tabKey ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            {tab}
                        </button>
                    )
                })}
            </div>

            <div className="min-h-[150px]">
                {formTab === 'REMARKS' ? (
                     <div className="max-w-2xl">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Remarks</label>
                        <textarea 
                            value={formData.remarks}
                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                            className="w-full h-32 border border-gray-300 rounded p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                            placeholder="Type your remarks here..."
                        />
                     </div>
                ) : (
                    <div className="max-w-lg">
                         <label className="text-sm font-medium text-gray-600 mb-2 block">Tax Rate</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]">
                             <option>Select a Tax</option>
                        </select>
                         <p className="text-xs text-gray-400 mt-2">
                            To associate more than one tax, you need to create a tax group in Settings.
                         </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  // ------------------------------------------------------------------
  // Overview Content (Inside Split Pane)
  // ------------------------------------------------------------------
  const renderOverviewContent = (customer: Customer) => (
    <div className="flex flex-col h-full animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Customer Information</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Type</span>
                         <span className="col-span-2 text-sm text-gray-800">{customer.type}</span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Contact</span>
                         <span className="col-span-2 text-sm text-gray-800">
                             {customer.salutation} {customer.firstName} {customer.lastName}
                         </span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Company</span>
                         <span className="col-span-2 text-sm text-gray-800">{customer.companyName || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Display Name</span>
                         <span className="col-span-2 text-sm text-gray-800 font-medium">{customer.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Email</span>
                         <span className="col-span-2 text-sm text-blue-600 hover:underline cursor-pointer truncate" title={customer.email}>{customer.email}</span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Phone</span>
                         <span className="col-span-2 text-sm text-gray-800">{customer.phone}</span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Mobile</span>
                         <span className="col-span-2 text-sm text-gray-800">{customer.mobile || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Payment Information */}
            <div>
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Payment Information</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Currency</span>
                         <span className="col-span-2 text-sm text-gray-800 flex items-center space-x-2">
                             <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">$</span>
                             <span>{customer.currency}</span>
                         </span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Terms</span>
                         <span className="col-span-2 text-sm text-gray-800">{customer.paymentTerms || 'Due on Receipt'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Receivables</span>
                         <span className="col-span-2 text-sm font-bold text-gray-800">
                             LKR {customer.receivables.toLocaleString()}
                         </span>
                    </div>
                    <div className="grid grid-cols-3">
                         <span className="text-sm text-gray-500 font-medium">Unused Credits</span>
                         <span className="col-span-2 text-sm font-bold text-gray-500">
                             LKR {customer.unusedCredits.toLocaleString()}
                         </span>
                    </div>
                </div>

                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                     <h4 className="text-xs font-bold text-yellow-800 mb-1 uppercase">Remarks</h4>
                     <p className="text-sm text-yellow-700 italic">
                         {customer.remarks || 'No remarks added.'}
                     </p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderTransactionsContent = (customer: Customer) => (
    <div className="h-full flex flex-col">
        <div className="border-b pb-4 mb-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <Receipt size={18} className="text-primary" />
            <span>Invoices & Payments</span>
        </h3>
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {invoices.filter(i => i.customerId === selectedCustomer?.id).length} Transactions
        </span>
        </div>
        
        <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b sticky top-0">
                <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Due</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {invoices.filter(i => i.customerId === customer.id).length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            No invoices found for this customer.
                        </td>
                    </tr>
                ) : (
                    invoices.filter(i => i.customerId === customer.id).map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {inv.date}
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800">{inv.invoiceNumber}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                    ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                    inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 
                                    inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {inv.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">LKR {inv.grandTotal.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-500">{inv.balanceDue > 0 ? `LKR ${inv.balanceDue.toLocaleString()}` : '-'}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
        </div>
    </div>
  );

  const renderStatementContent = (customer: Customer) => (
    <div className="h-full flex flex-col justify-center items-center text-gray-400 space-y-4">
        <div className="p-6 bg-gray-50 rounded-full">
            <FileBarChart size={48} />
        </div>
        <div className="text-center">
            <h3 className="text-lg font-bold text-gray-600">Statement of Accounts</h3>
            <p className="text-sm">Generate period-based statements for {customer.name}</p>
        </div>
        <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition">
            Generate Statement
        </button>
    </div>
  );

  // ------------------------------------------------------------------
  // View 1: New Customer / Edit Page (Full Screen Replacement)
  // ------------------------------------------------------------------
  if (viewMode === 'CREATE') {
      return (
          <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in">
              {/* Page Header */}
              <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center space-x-4">
                      <button onClick={() => setViewMode('LIST')} className="text-gray-500 hover:text-gray-800 transition">
                          <ArrowLeft size={24} />
                      </button>
                      <h2 className="text-2xl font-bold text-gray-800">
                          {formData.id ? 'Edit Customer' : 'New Customer'}
                      </h2>
                  </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-8">
                  <form onSubmit={handleSaveCustomer}>
                      {renderCustomerForm()}
                      
                      {/* Fixed Footer for Actions */}
                      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 px-8 flex items-center space-x-3 z-50 ml-64" style={{ width: 'calc(100% - 16rem)' }}>
                           <button 
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded shadow-sm hover:bg-blue-700 transition font-medium"
                           >
                               Save
                           </button>
                           <button 
                                type="button"
                                onClick={() => setViewMode('LIST')}
                                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium"
                           >
                               Cancel
                           </button>
                      </div>
                  </form>
              </div>
              <div className="h-20"></div> {/* Spacer for fixed footer */}
          </div>
      );
  }

  // ------------------------------------------------------------------
  // View 2: List & Split Pane Overview
  // ------------------------------------------------------------------
  return (
    <div className="flex h-full gap-6 relative" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
          
        {/* LEFT PANE: Customer List & Header */}
        <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-in-out border border-gray-100 gap-4
            ${selectedCustomer ? 'w-[30%] min-w-[320px] bg-white' : 'w-full'}
        `}>
          
          {/* Header - Moved inside left pane */}
          <div className="bg-white p-4 rounded-t-xl flex justify-between items-center z-20 relative flex-none">
            <div className={`${selectedCustomer ? 'hidden xl:block' : 'block'}`}>
                <h2 className="text-xl font-bold text-gray-800">Customers</h2>
                <p className={`text-sm text-gray-500 ${selectedCustomer ? 'hidden' : 'block'}`}>Manage clients</p>
            </div>
            
            <div className="flex items-center space-x-2 flex-1 justify-end">
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
                    onClick={handleOpenNewPage}
                    className="bg-primary hover:bg-sky-700 text-white p-2 px-3 rounded-lg flex items-center justify-center transition shadow-md whitespace-nowrap"
                    title="New Customer"
                >
                    <Plus size={20} />
                    <span className={`${selectedCustomer ? 'hidden' : 'ml-2 block'}`}>New</span>
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
                    <div className="absolute right-0 top-12 w-60 bg-white rounded-lg shadow-xl z-50 border border-gray-100 py-2 animate-fade-in text-sm" onClick={(e) => e.stopPropagation()}>
                        {/* Sort By Submenu */}
                        <div className="relative group">
                        <button className="w-full text-left px-4 py-2 bg-blue-500 text-white flex justify-between items-center hover:bg-blue-600 transition">
                            <span className="font-medium">Sort by</span>
                            <ChevronRight size={14} />
                        </button>
                        <div className="absolute right-full top-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block py-1 mr-1">
                            <button onClick={() => handleSort('name', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Name (A-Z)</button>
                            <button onClick={() => handleSort('name', 'desc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Name (Z-A)</button>
                            <button onClick={() => handleSort('companyName', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Company (A-Z)</button>
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

          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10 border-y border-gray-100">
                <tr className="text-xs text-gray-500 uppercase">
                  <th className={`px-6 py-4 font-semibold ${selectedCustomer ? 'w-[70%]' : 'w-[25%]'}`}>Name</th>
                  <th className={`px-6 py-4 font-semibold w-[20%] ${selectedCustomer ? 'hidden' : ''}`}>Company Name</th>
                  <th className={`px-6 py-4 font-semibold w-[20%] ${selectedCustomer ? 'hidden' : ''}`}>Email</th>
                  <th className={`px-6 py-4 font-semibold w-[15%] ${selectedCustomer ? 'hidden' : ''}`}>Phone</th>
                  <th className={`px-6 py-4 font-semibold text-right ${selectedCustomer ? 'w-[30%]' : 'w-[10%]'}`}>Receivables</th>
                  <th className={`px-6 py-4 font-semibold text-right w-[10%] ${selectedCustomer ? 'hidden' : ''}`}>Credits</th>
                  <th className={`px-6 py-4 font-semibold text-center w-[10%] ${selectedCustomer ? 'hidden' : ''}`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCustomers.map((customer) => (
                  <tr 
                      key={customer.id} 
                      onClick={() => { setSelectedCustomer(customer); setProfileActiveTab('OVERVIEW'); }}
                      className={`transition group cursor-pointer
                          ${selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-sky-50 border-l-4 border-transparent'}
                      `}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center space-x-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex-none flex items-center justify-center font-bold text-xs">
                          {customer.name.substring(0,2).toUpperCase()}
                      </div>
                      <div className="truncate">
                          <p className="truncate">{customer.name}</p>
                          <p className={`text-[10px] text-gray-400 font-normal truncate ${selectedCustomer ? '' : 'hidden'}`}>
                              {customer.companyName}
                          </p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-gray-600 truncate ${selectedCustomer ? 'hidden' : ''}`}>{customer.companyName || '-'}</td>
                    <td className={`px-6 py-4 text-gray-600 truncate ${selectedCustomer ? 'hidden' : ''}`}>{customer.email || '-'}</td>
                    <td className={`px-6 py-4 text-gray-600 truncate ${selectedCustomer ? 'hidden' : ''}`}>{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">
                        {selectedCustomer ? (
                            <div className="flex flex-col items-end">
                                <span>{customer.receivables.toLocaleString()}</span>
                                <span className="text-[10px] text-gray-400">LKR</span>
                            </div>
                        ) : (
                            customer.receivables.toLocaleString()
                        )}
                    </td>
                    <td className={`px-6 py-4 text-right text-gray-600 ${selectedCustomer ? 'hidden' : ''}`}>{customer.unusedCredits.toLocaleString()}</td>
                    
                    {/* Action Column */}
                    <td className={`px-6 py-4 text-center ${selectedCustomer ? 'hidden' : ''}`}>
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setFormData(customer);
                                setViewMode('CREATE');
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition"
                            title="Edit Customer"
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

        {/* RIGHT PANE: Overview (70% Width) */}
        {selectedCustomer && (
            <div className="w-[70%] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col animate-fade-in-right overflow-hidden relative z-30">
                {/* Compact Light Header */}
                <div className="bg-white p-3 border-b border-gray-100 flex justify-between items-center flex-none">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {selectedCustomer.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">{selectedCustomer.name}</h2>
                            <div className="flex items-center space-x-2 text-gray-400 text-xs">
                                <Building2 size={12} />
                                <span>{selectedCustomer.companyName || 'Individual'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 hover:text-red-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Toolbar / Actions */}
                <div className="bg-white px-4 py-2 flex items-center space-x-1 border-b border-gray-100 flex-none overflow-x-auto">
                    <button onClick={handleEditFromOverview} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                        <Edit size={14} /> <span>Edit</span>
                    </button>
                    <button onClick={handleCloneCustomer} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                        <Copy size={14} /> <span>Clone</span>
                    </button>
                    <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-red-50 text-sm font-medium text-gray-600 hover:text-red-600 transition whitespace-nowrap">
                        <Trash2 size={14} /> <span>Delete</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white px-6 flex space-x-6 border-b border-gray-100 flex-none">
                    {['Overview', 'Transactions', 'Statement'].map((tab) => {
                        const tabKey = tab.toUpperCase();
                        const isActive = profileActiveTab === tabKey;
                        return (
                            <button 
                                key={tab}
                                onClick={() => setProfileActiveTab(tabKey as any)}
                                className={`py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition
                                    ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white p-6">
                    {profileActiveTab === 'OVERVIEW' && renderOverviewContent(selectedCustomer)}
                    {profileActiveTab === 'TRANSACTIONS' && renderTransactionsContent(selectedCustomer)}
                    {profileActiveTab === 'STATEMENT' && renderStatementContent(selectedCustomer)}
                </div>
            </div>
        )}
      </div>
  );
};

export default Customers;
