
import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_DATA } from '../constants';
import { Search, ChevronDown, FileText, Package, CreditCard } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  onAction: (action: 'NEW_INVOICE' | 'NEW_GRN' | 'NEW_PAYMENT') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, onAction }) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  // Calculate KPIs
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'PAID').length;
  const pendingInvoices = invoices.filter(i => i.status === 'PENDING').length;
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE').length;

  // Calculate Receivables Logic
  const today = new Date();
  let totalReceivables = 0;
  let currentReceivables = 0;
  let overdue1_15 = 0;
  let overdue16_30 = 0;
  let overdue31_45 = 0;
  let overdueAbove45 = 0;

  invoices.forEach(inv => {
    if (inv.status !== InvoiceStatus.PAID) {
      const due = new Date(inv.dueDate);
      const diffTime = today.getTime() - due.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const amount = inv.balanceDue;
      totalReceivables += amount;

      if (diffDays <= 0) {
        currentReceivables += amount;
      } else if (diffDays <= 15) {
        overdue1_15 += amount;
      } else if (diffDays <= 30) {
        overdue16_30 += amount;
      } else if (diffDays <= 45) {
        overdue31_45 += amount;
      } else {
        overdueAbove45 += amount;
      }
    }
  });

  return (
    <div className="flex flex-col space-y-6 h-full" onClick={() => isNewMenuOpen && setIsNewMenuOpen(false)}>
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm z-20 relative">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        
        <div className="flex-1 max-w-lg mx-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search invoice number, customer, date..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Right side placeholder if needed, or just empty since icons moved to sidebar */}
        <div className="w-10"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 custom-scrollbar">
        
        {/* Total Receivables Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible relative z-10">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Total Receivables</h2>
                        <p className="text-sm text-gray-500 mt-1">Total Unpaid Invoices</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">LKR {totalReceivables.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    
                    {/* Quick Action Button */}
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsNewMenuOpen(!isNewMenuOpen); }}
                            className="bg-primary hover:bg-sky-700 text-white pl-4 pr-3 py-2 rounded-lg flex items-center space-x-2 transition shadow-md font-medium"
                        >
                            <span>+ New</span>
                            <ChevronDown size={16} />
                        </button>

                        {isNewMenuOpen && (
                            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 animate-fade-in text-sm overflow-hidden z-50">
                                <button onClick={() => onAction('NEW_INVOICE')} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center space-x-3 transition">
                                    <FileText size={16} className="text-primary"/> <span>New Invoice</span>
                                </button>
                                <button onClick={() => onAction('NEW_GRN')} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center space-x-3 transition">
                                    <Package size={16} className="text-green-600"/> <span>New Stock (GRN)</span>
                                </button>
                                <button onClick={() => onAction('NEW_PAYMENT')} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center space-x-3 transition">
                                    <CreditCard size={16} className="text-purple-600"/> <span>New Payment</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visual Bar */}
                <div className="flex h-4 rounded-full overflow-hidden mb-6 bg-gray-100">
                    <div className="bg-blue-500 h-full" style={{ width: `${(currentReceivables / (totalReceivables || 1)) * 100}%` }} title="Current" />
                    <div className="bg-yellow-400 h-full" style={{ width: `${(overdue1_15 / (totalReceivables || 1)) * 100}%` }} title="1-15 Days" />
                    <div className="bg-orange-400 h-full" style={{ width: `${(overdue16_30 / (totalReceivables || 1)) * 100}%` }} title="16-30 Days" />
                    <div className="bg-red-400 h-full" style={{ width: `${(overdue31_45 / (totalReceivables || 1)) * 100}%` }} title="31-45 Days" />
                    <div className="bg-red-600 h-full" style={{ width: `${(overdueAbove45 / (totalReceivables || 1)) * 100}%` }} title=">45 Days" />
                </div>

                {/* Legend Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 border-t pt-6">
                    {/* Current */}
                    <div className="border-l-2 border-blue-500 pl-3">
                        <p className="text-xs font-bold text-blue-500 uppercase mb-1">Current</p>
                        <p className="text-lg font-bold text-gray-800">LKR {currentReceivables.toLocaleString()}</p>
                    </div>
                    
                    {/* Overdue Section Header - Visual separation only, integrated in columns below */}
                    
                    <div className="border-l-2 border-yellow-400 pl-3">
                         <p className="text-xs font-bold text-red-500 uppercase mb-1">Overdue <span className="text-gray-400 font-normal ml-1">1-15 Days</span></p>
                         <p className="text-lg font-bold text-gray-800">LKR {overdue1_15.toLocaleString()}</p>
                    </div>

                    <div className="border-l-2 border-orange-400 pl-3">
                         <p className="text-xs font-bold text-red-500 uppercase mb-1">Overdue <span className="text-gray-400 font-normal ml-1">16-30 Days</span></p>
                         <p className="text-lg font-bold text-gray-800">LKR {overdue16_30.toLocaleString()}</p>
                    </div>

                    <div className="border-l-2 border-red-400 pl-3">
                         <p className="text-xs font-bold text-red-500 uppercase mb-1">Overdue <span className="text-gray-400 font-normal ml-1">31-45 Days</span></p>
                         <p className="text-lg font-bold text-gray-800">LKR {overdue31_45.toLocaleString()}</p>
                    </div>

                    <div className="border-l-2 border-red-600 pl-3">
                         <p className="text-xs font-bold text-red-500 uppercase mb-1">Overdue <span className="text-gray-400 font-normal ml-1">&gt; 45 Days</span></p>
                         <p className="text-lg font-bold text-gray-800">LKR {overdueAbove45.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Existing KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm uppercase font-semibold">Total Invoices</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{totalInvoices}</h2>
            <p className="text-xs text-gray-400 mt-1">Current financial year</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm uppercase font-semibold">Paid</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{paidInvoices}</h2>
            <p className="text-xs text-gray-400 mt-1">Fully settled</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm uppercase font-semibold">Pending</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{pendingInvoices}</h2>
            <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm uppercase font-semibold">Overdue</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{overdueInvoices}</h2>
            <p className="text-xs text-gray-400 mt-1">Action required</p>
            </div>
        </div>

        {/* Chart Section & Recent Invoices */}
        <div className="grid grid-cols-3 gap-6">
            
            {/* Chart */}
            <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">6 Months Sales Cost and Profit Comparison</h3>
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={CHART_DATA}
                    margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                    <Tooltip 
                        cursor={{fill: '#F3F4F6'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="Sales" fill="#0077B6" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Cost" fill="#0096C7" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Profit" fill="#FF7F7F" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Recent Invoices Table Preview */}
            <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Invoices</h3>
                <button className="text-primary text-sm hover:underline">View All</button>
            </div>
            
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 uppercase sticky top-0">
                    <tr>
                    <th className="px-3 py-2">Invoice #</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {invoices.slice(0, 8).map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-3 font-medium text-gray-700">{inv.invoiceNumber}</td>
                        <td className="px-3 py-3 text-gray-600 truncate max-w-[100px]">{inv.customerName}</td>
                        <td className="px-3 py-3 text-right font-medium">LKR {inv.grandTotal.toLocaleString()}</td>
                        <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                            ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                            inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 
                            inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                        `}>
                            {inv.status}
                        </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
