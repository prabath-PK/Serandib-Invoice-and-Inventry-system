
import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Receipt, Package, Users, FileText, CreditCard, Bell, Settings, User, LogOut } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'HOME', label: 'HOME', icon: <LayoutDashboard size={20} /> },
    { id: 'INVOICE', label: 'INVOICE', icon: <Receipt size={20} /> },
    { id: 'INVENTORY', label: 'INVENTORY', icon: <Package size={20} /> },
    { id: 'CUSTOMER', label: 'CUSTOMER', icon: <Users size={20} /> },
    { id: 'PAYMENTS', label: 'PAYMENTS', icon: <CreditCard size={20} /> },
    { id: 'REPORT', label: 'REPORT', icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden print:h-auto print:overflow-visible">
      
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#111827] text-white z-50 flex items-center justify-between px-6 shadow-md print:hidden">
        
        {/* Left: Logo & Company Name */}
        <div className="flex items-center gap-5 select-none">
            {/* Logo Box */}
            <div className="border border-gray-500 rounded px-4 py-1.5 flex items-center justify-center hover:border-gray-300 transition-colors bg-gray-800">
               <span className="text-white font-bold tracking-widest text-sm uppercase">LOGO</span>
            </div>
            
            {/* Vertical Separator */}
            <div className="h-8 w-px bg-gray-700"></div>

            {/* Company Name */}
            <h1 className="text-lg font-bold text-white tracking-tight">
              Company Name
            </h1>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center space-x-4">
             <button className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-full relative" title="Notifications">
                <Bell size={20} />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-gray-900"></span>
             </button>
             <button className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-full" title="Settings">
                <Settings size={20} />
             </button>
             
             <div className="h-8 w-px bg-gray-700 mx-2"></div>

             {/* User Profile */}
             <div className="flex items-center space-x-3 pl-2 cursor-pointer group">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:bg-sky-500 transition">
                    <User size={18} />
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-xs font-bold text-white leading-tight">Admin User</p>
                    <p className="text-[10px] text-gray-400 leading-tight">admin@company.com</p>
                </div>
             </div>
        </div>
      </header>

      {/* Left Sidebar Navigation */}
      <aside className="fixed top-16 left-0 w-64 bottom-0 bg-[#1f2937] text-white flex flex-col shadow-xl z-40 print:hidden overflow-y-auto custom-scrollbar">
        <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`
                  w-full flex items-center space-x-4 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 uppercase tracking-wide group
                  ${currentView === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <span className={`${currentView === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white transition'}`}>
                    {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
        </nav>
        
        {/* Sidebar Footer (Optional Logout) */}
        <div className="p-4 border-t border-gray-700 mt-auto">
             <button className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition uppercase tracking-wide">
                <LogOut size={20} />
                <span>Logout</span>
             </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 mt-16 flex-1 overflow-auto bg-background w-full h-[calc(100vh-64px)] p-6 relative print:ml-0 print:mt-0 print:h-auto print:overflow-visible">
        <div className="max-w-full mx-auto h-full flex flex-col print:h-auto print:w-full print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
