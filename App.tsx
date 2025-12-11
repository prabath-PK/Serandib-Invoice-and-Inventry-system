
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Inventory from './components/Inventory';
import InvoicePOS from './components/InvoicePOS';
import Payments from './components/Payments';
import { ViewState, Customer, Item, Invoice, Supplier, Payment } from './types';
import { INITIAL_CUSTOMERS, INITIAL_ITEMS, INITIAL_INVOICES, INITIAL_SUPPLIERS, INITIAL_PAYMENTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);

  // State to handle deep linking from Dashboard to specific modes
  const [pendingAction, setPendingAction] = useState<'NEW_INVOICE' | 'NEW_GRN' | null>(null);

  const handleAddCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const handleAddItem = (item: Item) => {
    setItems([...items, item]);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleCreateInvoice = (invoice: Invoice) => {
    setInvoices([invoice, ...invoices]);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  // Supplier Handlers
  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers([...suppliers, supplier]);
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
  };

  const handleDashboardAction = (action: 'NEW_INVOICE' | 'NEW_GRN' | 'NEW_PAYMENT') => {
    if (action === 'NEW_INVOICE') {
      setPendingAction('NEW_INVOICE');
      setCurrentView('INVOICE');
    } else if (action === 'NEW_GRN') {
      setPendingAction('NEW_GRN');
      setCurrentView('INVENTORY');
    } else if (action === 'NEW_PAYMENT') {
      setCurrentView('PAYMENTS');
    }
  };

  // Wrapper for view switching that clears pending actions
  const changeView = (view: ViewState) => {
    setPendingAction(null);
    setCurrentView(view);
  }

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <Dashboard invoices={invoices} onAction={handleDashboardAction} />;
      case 'CUSTOMER':
        return (
          <Customers 
            customers={customers} 
            invoices={invoices}
            onAddCustomer={handleAddCustomer} 
            onUpdateCustomer={handleUpdateCustomer}
          />
        );
      case 'INVENTORY':
        return (
          <Inventory 
            items={items}
            suppliers={suppliers} 
            onAddItem={handleAddItem} 
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            initialViewMode={pendingAction === 'NEW_GRN' ? 'GRN' : undefined}
          />
        );
      case 'INVOICE':
        return (
          <InvoicePOS 
            customers={customers} 
            items={items} 
            invoices={invoices}
            onCreateInvoice={handleCreateInvoice} 
            onUpdateInvoice={handleUpdateInvoice}
            initialViewMode={pendingAction === 'NEW_INVOICE' ? 'CREATE' : undefined}
          />
        );
      case 'PAYMENTS':
        return (
          <Payments payments={payments} />
        );
      case 'REPORT':
        return (
          <div className="flex items-center justify-center h-full text-gray-400 flex-col">
            <h2 className="text-2xl font-bold mb-2">Reports Module</h2>
            <p>Select a report type to view detailed analytics.</p>
          </div>
        );
      default:
        return <Dashboard invoices={invoices} onAction={handleDashboardAction} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={changeView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
