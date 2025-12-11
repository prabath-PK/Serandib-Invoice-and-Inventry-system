
import React, { useState } from 'react';
import { Payment } from '../types';
import { 
  Search, Plus, MoreHorizontal, ChevronRight, Upload, Download, 
  Settings, RefreshCw, CreditCard, SlidersHorizontal, ArrowUpDown,
  X, Printer, Mail, Share2, Copy, Trash2, Edit, FileText, CheckCircle, Clock
} from 'lucide-react';

interface PaymentsProps {
  payments: Payment[];
}

const Payments: React.FC<PaymentsProps> = ({ payments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Selection State (Split View)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'HISTORY'>('OVERVIEW');

  const filteredPayments = payments.filter(p => 
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.paymentNumber.includes(searchTerm) ||
    p.invoiceNumbers.some(inv => inv.includes(searchTerm))
  );

  const handlePrint = () => {
      window.print();
  }

  // ------------------------------------------------------------------
  // Render: Payment Receipt (Overview)
  // ------------------------------------------------------------------
  const renderPaymentOverview = (payment: Payment) => {
    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 animate-fade-in-right overflow-hidden">
             {/* Compact Header */}
             <div className="bg-white p-3 border-b border-gray-100 flex justify-between items-center flex-none print:hidden">
                <div className="flex items-center space-x-3">
                     <div className="h-10 w-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center border border-green-200">
                        <CreditCard size={20} />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-tight">Payment #{payment.paymentNumber}</h2>
                         <div className="flex items-center space-x-2 text-xs mt-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                {payment.status}
                            </span>
                            <span className="text-gray-400">| {payment.date}</span>
                        </div>
                     </div>
                </div>
                <div className="flex items-center space-x-1">
                     <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Toolbar / Actions */}
            <div className="bg-white px-4 py-2 flex items-center space-x-1 border-b border-gray-100 flex-none overflow-x-auto print:hidden">
                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
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

            {/* Tabs */}
            <div className="bg-white px-6 flex space-x-6 border-b border-gray-100 flex-none print:hidden">
                {['Overview', 'Transactions', 'History'].map((tab) => {
                    const tabKey = tab.toUpperCase();
                    const isActive = activeTab === tabKey;
                    return (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tabKey as any)}
                            className={`py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition
                                ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}
                            `}
                        >
                            {tab}
                        </button>
                    )
                })}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
                {activeTab === 'OVERVIEW' && (
                    <div className="bg-white shadow-lg border border-gray-200 p-[40px] max-w-[210mm] mx-auto min-h-[148mm] relative text-[#333] font-sans print:shadow-none print:border-none print:w-full print:max-w-none print:p-0">
                        
                        {/* 1. Header Section */}
                        <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                            <div>
                                {/* Logo Placeholder */}
                                <div className="w-32 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400 font-bold tracking-widest">LOGO</span>
                                </div>
                            </div>
                            <div className="text-right text-xs leading-5 text-gray-600">
                                <h3 className="font-bold text-gray-800 text-sm uppercase mb-1">COMPANY NAME</h3>
                                <p>Address Line 1</p>
                                <p>City, Country</p>
                                <p>+00 000 000 000</p>
                                <p>email@example.com</p>
                            </div>
                        </div>

                        {/* 2. Title & Meta */}
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest mb-2">Payment Receipt</h2>
                            <p className="text-sm text-gray-500">Thank you for your payment</p>
                        </div>

                        <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="text-center flex-1 border-r border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payment Date</p>
                                <p className="font-medium text-gray-800">{payment.date}</p>
                            </div>
                            <div className="text-center flex-1 border-r border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payment #</p>
                                <p className="font-medium text-gray-800">{payment.paymentNumber}</p>
                            </div>
                            <div className="text-center flex-1 border-r border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payment Mode</p>
                                <p className="font-medium text-gray-800">{payment.mode}</p>
                            </div>
                            <div className="text-center flex-1">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Reference #</p>
                                <p className="font-medium text-gray-800">{payment.referenceNumber || '-'}</p>
                            </div>
                        </div>

                        {/* 3. Received From & Amount */}
                        <div className="flex justify-between items-start mb-10">
                             <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Received From</p>
                                <h3 className="text-xl font-bold text-primary">{payment.customerName}</h3>
                                <p className="text-sm text-gray-600 mt-1">Valued Customer</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Amount Received</p>
                                <h3 className="text-3xl font-bold text-gray-800">LKR {payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                             </div>
                        </div>

                        {/* 4. Payment Breakdown Table */}
                        <div className="mb-10">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">Payment Allocation</h4>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 font-medium">
                                    <tr>
                                        <th className="py-2 px-3 rounded-l-md">Invoice Number</th>
                                        <th className="py-2 px-3 text-right">Invoice Date</th>
                                        <th className="py-2 px-3 text-right">Invoice Amount</th>
                                        <th className="py-2 px-3 text-right rounded-r-md">Payment Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {/* Mocking breakdown logic since only strings are stored */}
                                    {payment.invoiceNumbers.map((invNum, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 last:border-none">
                                            <td className="py-3 px-3 font-medium text-primary">{invNum}</td>
                                            <td className="py-3 px-3 text-right text-gray-500">
                                                {/* Mock date matching payment date logic for demo */}
                                                {payment.date}
                                            </td> 
                                            <td className="py-3 px-3 text-right text-gray-500">
                                                {/* Assuming single invoice covers full amount for demo visual */}
                                                {(payment.amount / payment.invoiceNumbers.length).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold text-gray-800">
                                                {(payment.amount / payment.invoiceNumbers.length).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-100">
                                        <td colSpan={2} className="py-3 px-3"></td>
                                        <td className="py-3 px-3 text-right font-bold text-gray-600">Total Applied</td>
                                        <td className="py-3 px-3 text-right font-bold text-gray-800">
                                            {(payment.amount - payment.unusedAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                     <tr>
                                        <td colSpan={2} className="py-2 px-3"></td>
                                        <td className="py-2 px-3 text-right font-bold text-gray-500 text-xs">Unused Amount</td>
                                        <td className="py-2 px-3 text-right font-medium text-gray-500 text-xs">
                                            {payment.unusedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        {/* Footer Signature */}
                        <div className="mt-16 flex justify-end">
                             <div className="text-center">
                                 <div className="w-48 h-px bg-gray-300 mb-2"></div>
                                 <p className="text-xs text-gray-500 font-medium uppercase">Authorized Signature</p>
                             </div>
                        </div>

                    </div>
                )}

                {/* Placeholders for other tabs */}
                {activeTab === 'TRANSACTIONS' && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <CreditCard size={48} className="mb-4 opacity-50"/>
                        <p className="font-medium">No additional transactions linked.</p>
                    </div>
                )}
                {activeTab === 'HISTORY' && (
                     <div className="space-y-6 max-w-lg mx-auto pt-10">
                        <div className="flex space-x-4 relative">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center z-10">
                                    <CheckCircle size={16} />
                                </div>
                                <div className="w-px h-full bg-gray-200 absolute top-8 left-4"></div>
                            </div>
                            <div className="pb-8">
                                <p className="text-sm font-bold text-gray-800">Payment Received</p>
                                <p className="text-xs text-gray-500">Payment of <span className="font-medium">{payment.amount.toLocaleString()}</span> was recorded via {payment.mode}.</p>
                                <p className="text-[10px] text-gray-400 mt-1">{payment.date} by Admin</p>
                            </div>
                        </div>
                        <div className="flex space-x-4 relative">
                             <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center z-10">
                                    <Mail size={16} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Receipt Sent</p>
                                <p className="text-xs text-gray-500">Payment receipt emailed to customer.</p>
                                <p className="text-[10px] text-gray-400 mt-1">{payment.date} by System</p>
                            </div>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-full gap-6 relative" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
      
        {/* LEFT PANE: Header + Filters + List */}
        <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-in-out border border-gray-100 gap-4 print:hidden
            ${selectedPayment ? 'w-[30%] min-w-[350px] bg-white' : 'w-full'}
        `}>
            {/* Header */}
             <div className="bg-white p-4 rounded-t-xl z-20 relative flex-none">
                 <div className="flex justify-between items-center mb-4">
                     <div className={`${selectedPayment ? 'hidden xl:block' : 'block'}`}>
                        <h2 className="text-xl font-bold text-gray-800">Received Payments</h2>
                        <p className={`text-sm text-gray-500 ${selectedPayment ? 'hidden' : 'block'}`}>Manage your payments</p>
                     </div>

                      <div className="flex items-center space-x-2 flex-1 justify-end">
                           <div className="relative flex-1 max-w-[200px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`pl-9 pr-3 py-2 bg-gray-800 text-white placeholder-gray-400 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all
                                        ${selectedPayment ? 'w-full' : 'w-48'}
                                    `}
                                />
                            </div>

                            <button className="bg-primary hover:bg-sky-700 text-white px-3 py-2 rounded-lg flex items-center justify-center transition shadow-md font-medium">
                                <Plus size={18} />
                                <span className={`${selectedPayment ? 'hidden' : 'ml-2'}`}>New</span>
                            </button>

                             {/* Options Menu */}
                            <div className="relative">
                                <button 
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                className={`p-2 rounded-lg transition border ${isMenuOpen ? 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`}
                                >
                                <MoreHorizontal size={20} />
                                </button>

                                {isMenuOpen && (
                                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-100 py-2 animate-fade-in text-sm" onClick={(e) => e.stopPropagation()}>
                                    {/* Menu Items */}
                                    <div className="relative group">
                                        <button className="w-full text-left px-4 py-3 bg-primary text-white flex justify-between items-center hover:bg-sky-600 transition">
                                            <div className="flex items-center space-x-2">
                                                <ArrowUpDown size={14} />
                                                <span className="font-medium">Sort by</span>
                                            </div>
                                            <ChevronRight size={14} />
                                        </button>
                                        <div className="absolute right-full top-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block py-1 mr-1">
                                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Date (Newest First)</button>
                                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Amount (High to Low)</button>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 flex items-center space-x-3">
                                        <Upload size={14} className="text-gray-400" /> <span>Import</span>
                                    </button>
                                    <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 flex items-center space-x-3">
                                        <Download size={14} className="text-gray-400" /> <span>Export Payments</span>
                                    </button>
                                </div>
                                )}
                            </div>
                      </div>
                 </div>
             </div>

             {/* List Content */}
             <div className="flex-1 overflow-auto custom-scrollbar">
                 <table className="w-full text-left border-collapse table-fixed">
                     <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                         <tr className="text-xs font-bold text-gray-500 uppercase">
                             <th className={`px-4 py-3 ${selectedPayment ? 'w-24' : 'w-32'}`}>Date</th>
                             <th className={`px-4 py-3 ${selectedPayment ? 'w-20' : 'w-32'}`}>Payment #</th>
                             <th className={`px-4 py-3 ${selectedPayment ? 'w-40' : 'w-48'}`}>Customer</th>
                             <th className={`px-4 py-3 text-right ${selectedPayment ? 'w-24' : 'w-40'}`}>Amount</th>
                             
                             {/* Hide these columns when detail view is open */}
                             <th className={`px-4 py-3 w-40 ${selectedPayment ? 'hidden' : ''}`}>Reference</th>
                             <th className={`px-4 py-3 w-64 ${selectedPayment ? 'hidden' : ''}`}>Invoice #</th>
                             <th className={`px-4 py-3 w-32 ${selectedPayment ? 'hidden' : ''}`}>Mode</th>
                             <th className={`px-4 py-3 w-32 ${selectedPayment ? 'hidden' : ''}`}>Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 text-sm">
                         {filteredPayments.map((payment) => (
                             <tr 
                                key={payment.id} 
                                onClick={() => setSelectedPayment(payment)}
                                className={`transition cursor-pointer group
                                    ${selectedPayment?.id === payment.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-sky-50 border-l-4 border-transparent'}
                                `}
                             >
                                 <td className="px-4 py-4 text-gray-600 font-medium truncate">{payment.date}</td>
                                 <td className="px-4 py-4">
                                     <span className="text-primary font-medium">{payment.paymentNumber}</span>
                                 </td>
                                 <td className="px-4 py-4 text-gray-800 font-medium truncate" title={payment.customerName}>{payment.customerName}</td>
                                 <td className="px-4 py-4 text-right font-bold text-gray-800 truncate">
                                     {selectedPayment ? '' : <span className="text-xs text-gray-400 mr-1">LKR</span>}
                                     {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                 </td>

                                 {/* Hidden Columns */}
                                 <td className={`px-4 py-4 text-gray-500 truncate ${selectedPayment ? 'hidden' : ''}`}>{payment.referenceNumber}</td>
                                 <td className={`px-4 py-4 text-gray-500 text-xs leading-relaxed truncate ${selectedPayment ? 'hidden' : ''}`}>
                                     {payment.invoiceNumbers.join(', ')}
                                 </td>
                                 <td className={`px-4 py-4 text-gray-600 ${selectedPayment ? 'hidden' : ''}`}>{payment.mode}</td>
                                 <td className={`px-4 py-4 ${selectedPayment ? 'hidden' : ''}`}>
                                     <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-600">
                                         {payment.status}
                                     </span>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
                 
                  {/* Empty State */}
                  {filteredPayments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Search size={48} className="mb-4 opacity-50" />
                            <p className="font-medium">No payments found</p>
                            <p className="text-sm">Try adjusting your search terms</p>
                        </div>
                   )}
             </div>
        </div>

        {/* RIGHT PANE: Detail Overview (70% Width) */}
        {selectedPayment && (
             <div className="w-[70%] h-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col animate-fade-in-right overflow-hidden relative z-30 print:w-full print:fixed print:inset-0 print:z-[100] print:h-screen print:bg-white print:border-none print:shadow-none">
                {renderPaymentOverview(selectedPayment)}
             </div>
        )}
    </div>
  );
};

export default Payments;
