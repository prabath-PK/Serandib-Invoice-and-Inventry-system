
import React, { useState, useEffect } from 'react';
import { Item, Supplier } from '../types';
import { CATEGORIES } from '../constants';
import { 
  Plus, Search, Edit, Trash2, MoreHorizontal, X, Upload, 
  Package, Tag, Image as ImageIcon, ChevronRight, FileSpreadsheet, 
  FileText, Settings, RefreshCw, Download, ArrowLeft, Info, CheckCircle, Truck, DollarSign, User, Phone, Mail, MapPin, List, History as HistoryIcon, Activity, Copy
} from 'lucide-react';

interface InventoryProps {
  items: Item[];
  suppliers: Supplier[];
  onAddItem: (item: Item) => void;
  onUpdateItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onAddSupplier: (supplier: Supplier) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  initialViewMode?: 'LIST' | 'CREATE' | 'GRN';
}

type SortKey = 'name' | 'sku' | 'price' | 'stockQty';

interface GRNLineItem {
  itemId: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
  discount: number;
  total: number;
}

const Inventory: React.FC<InventoryProps> = ({ 
    items, suppliers, onAddItem, onUpdateItem, onDeleteItem,
    onAddSupplier, onUpdateSupplier, onDeleteSupplier,
    initialViewMode
}) => {
  // View State: 'LIST' | 'CREATE' | 'GRN'
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'GRN'>('LIST');
  
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
      if (initialViewMode === 'GRN') {
          handleGRNOpen();
      }
    }
  }, [initialViewMode]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State (Split View)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'HISTORY'>('OVERVIEW');
  
  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  // Form State (Create/Edit Item)
  const [formData, setFormData] = useState<Partial<Item>>({});

  // GRN State
  const [grnDate, setGrnDate] = useState(new Date().toISOString().split('T')[0]);
  const [grnSupplier, setGrnSupplier] = useState('');
  const [grnLines, setGrnLines] = useState<GRNLineItem[]>([]);
  
  // GRN Input State (Current line being added)
  const [currentGRNItem, setCurrentGRNItem] = useState<{
      itemId: string;
      quantity: number;
      unitCost: number;
      discount: number;
  }>({ itemId: '', quantity: 1, unitCost: 0, discount: 0 });

  // Supplier Mgmt State (Inside GRN)
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({});
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  // Update unit cost when item is selected in GRN line
  useEffect(() => {
     if (currentGRNItem.itemId) {
         const item = items.find(i => i.id === currentGRNItem.itemId);
         if (item) {
             setCurrentGRNItem(prev => ({
                 ...prev,
                 unitCost: item.cost
             }));
             // Auto-fill supplier if empty and item has one
             if (!grnSupplier && item.supplier) {
                 setGrnSupplier(item.supplier);
             }
         }
     }
  }, [currentGRNItem.itemId]);

  const filteredItems = items
    .filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      if (key === 'price' || key === 'stockQty') {
        return (a[key] - b[key]) * direction;
      }
      
      const valA = (a[key] || '').toLowerCase();
      const valB = (b[key] || '').toLowerCase();
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });

  const filteredSuppliers = suppliers.filter(s => 
      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || 
      s.contactPerson.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const handleCreateOpen = () => {
    setSelectedItem(null);
    setFormData({
      category: 'Beverage',
      stockQty: 0,
      cost: 0,
      price: 0,
      unit: 'Unit'
    });
    setViewMode('CREATE');
  };

  const handleEditFullPage = (item: Item) => {
    setFormData(item);
    if (!selectedItem || selectedItem.id !== item.id) {
        setSelectedItem(null); 
    }
    setViewMode('CREATE');
  };

  const handleCloneItem = () => {
    if (selectedItem) {
        const { id, ...rest } = selectedItem;
        setFormData({ ...rest, name: `${rest.name} (Copy)`, sku: `${rest.sku}-COPY` });
        setViewMode('CREATE');
    }
  }

  const handleDeleteItemAction = () => {
    if (selectedItem) {
        onDeleteItem(selectedItem.id);
        setSelectedItem(null);
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return; 

    const itemToSave = {
        ...formData,
        id: formData.id || Date.now().toString(),
        stockQty: Number(formData.stockQty),
        cost: Number(formData.cost),
        price: Number(formData.price),
    } as Item;

    if (formData.id && items.find(i => i.id === formData.id)) {
        onUpdateItem(itemToSave);
        if (selectedItem && selectedItem.id === itemToSave.id) {
            setSelectedItem(itemToSave);
        }
    } else {
        onAddItem(itemToSave);
    }
    setViewMode('LIST');
  };

  const handleDelete = () => {
    if (formData.id) {
        onDeleteItem(formData.id);
        if (selectedItem?.id === formData.id) setSelectedItem(null);
        setViewMode('LIST');
    }
  };

  const handleSort = (key: SortKey, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setIsMenuOpen(false);
  };

  // ------------------------------------------------------------------
  // GRN Logic
  // ------------------------------------------------------------------

  const handleGRNOpen = () => {
      setGrnLines([]);
      setGrnSupplier('');
      setGrnDate(new Date().toISOString().split('T')[0]);
      setCurrentGRNItem({ itemId: '', quantity: 1, unitCost: 0, discount: 0 });
      setIsAddingSupplier(false);
      setViewMode('GRN');
  };

  const addLineToGRN = () => {
      if (!currentGRNItem.itemId || currentGRNItem.quantity <= 0) return;
      
      const item = items.find(i => i.id === currentGRNItem.itemId);
      if (!item) return;

      const total = (currentGRNItem.quantity * currentGRNItem.unitCost) - currentGRNItem.discount;

      const newLine: GRNLineItem = {
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          quantity: currentGRNItem.quantity,
          unitCost: currentGRNItem.unitCost,
          discount: currentGRNItem.discount,
          total: Math.max(0, total)
      };

      setGrnLines([...grnLines, newLine]);
      // Reset input, keep supplier/date
      setCurrentGRNItem({ itemId: '', quantity: 1, unitCost: 0, discount: 0 });
  };

  const removeLineFromGRN = (index: number) => {
      const newLines = [...grnLines];
      newLines.splice(index, 1);
      setGrnLines(newLines);
  };

  const confirmGRN = () => {
      if (grnLines.length === 0) return;

      // Process each line item
      grnLines.forEach(line => {
          const originalItem = items.find(i => i.id === line.itemId);
          if (originalItem) {
              const updatedItem: Item = {
                  ...originalItem,
                  stockQty: originalItem.stockQty + line.quantity,
                  cost: line.unitCost, // Update cost to new incoming price
                  supplier: grnSupplier || originalItem.supplier // Update supplier if provided
              };
              onUpdateItem(updatedItem);
              
              // Update selection if visible
              if (selectedItem && selectedItem.id === updatedItem.id) {
                  setSelectedItem(updatedItem);
              }
          }
      });

      setViewMode('LIST');
  };

  const handleSaveSupplier = () => {
      if (!supplierForm.name) return;
      const newSupplier = {
          ...supplierForm,
          id: supplierForm.id || Date.now().toString(),
      } as Supplier;
      
      if (supplierForm.id) {
          onUpdateSupplier(newSupplier);
      } else {
          onAddSupplier(newSupplier);
      }
      setIsAddingSupplier(false);
      setSupplierForm({});
  };

  const grnGrandTotal = grnLines.reduce((acc, line) => acc + line.total, 0);


  // ------------------------------------------------------------------
  // Reusable Form Component (Used in Create/Edit Item)
  // ------------------------------------------------------------------
  const renderItemForm = () => (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Image Upload Placeholder */}
        <div className="flex items-start space-x-6">
            <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-600 mb-2">Item Image</label>
                <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-[#fcfbf7] hover:bg-gray-50 transition flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                <Upload className="text-gray-400 group-hover:text-primary" size={20} />
                            </div>
                            <p className="text-sm text-gray-500 font-medium group-hover:text-primary">Click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </>
                    )}
                </div>
            </div>
            
            <div className="w-2/3 space-y-6">
                 {/* Basic Info */}
                <div className="space-y-4">
                    <div className="flex items-center">
                         <label className="w-40 text-sm font-medium text-gray-600">Item Name <span className="text-red-500">*</span></label>
                         <input 
                            type="text" 
                            required
                            value={formData.name || ''}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                            placeholder="e.g. Apple Cider"
                        />
                    </div>
                    <div className="flex items-center">
                         <label className="w-40 text-sm font-medium text-gray-600">SKU <span className="text-red-500">*</span></label>
                         <input 
                            type="text" 
                            required
                            value={formData.sku || ''}
                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                            placeholder="e.g. BV-001"
                        />
                    </div>
                     <div className="flex items-center">
                         <label className="w-40 text-sm font-medium text-gray-600">Category</label>
                         <select 
                            value={formData.category || 'Beverage'}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                        >
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                     <div className="flex items-center">
                         <label className="w-40 text-sm font-medium text-gray-600">Unit</label>
                         <select 
                             value={formData.unit || 'Unit'}
                             onChange={(e) => setFormData({...formData, unit: e.target.value})}
                             className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                         >
                             <option>Unit</option>
                             <option>Pack</option>
                             <option>Box</option>
                             <option>Kg</option>
                             <option>Ltr</option>
                         </select>
                    </div>
                </div>
            </div>
        </div>

        <hr className="border-gray-100"/>

        {/* Sales & Purchase Info */}
        <div className="grid grid-cols-2 gap-12">
            <div>
                 <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Sales Information</h4>
                 <div className="space-y-4">
                     <div className="flex items-center">
                         <label className="w-32 text-sm font-medium text-gray-600">Selling Price</label>
                         <div className="flex-1 relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">LKR</span>
                             <input 
                                type="number" 
                                value={formData.price || 0}
                                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                             />
                         </div>
                     </div>
                     <div className="flex items-start">
                         <label className="w-32 text-sm font-medium text-gray-600 pt-2">Description</label>
                         <textarea 
                             value={formData.description || ''}
                             onChange={(e) => setFormData({...formData, description: e.target.value})}
                             className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7] h-20"
                         />
                     </div>
                 </div>
            </div>
            
            <div>
                 <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Purchase Information</h4>
                 <div className="space-y-4">
                     <div className="flex items-center">
                         <label className="w-32 text-sm font-medium text-gray-600">Cost Price</label>
                         <div className="flex-1 relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">LKR</span>
                             <input 
                                type="number" 
                                value={formData.cost || 0}
                                onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                             />
                         </div>
                     </div>
                     <div className="flex items-center">
                         <label className="w-32 text-sm font-medium text-gray-600">Supplier</label>
                         <input 
                             type="text" 
                             value={formData.supplier || ''}
                             onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                             placeholder="Supplier Name"
                             className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                         />
                     </div>
                 </div>
            </div>
        </div>

        <hr className="border-gray-100"/>

        {/* Inventory Info */}
         <div>
             <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Track Inventory</h4>
             <div className="flex items-center max-w-md">
                 <label className="w-32 text-sm font-medium text-gray-600">Opening Stock</label>
                 <input 
                    type="number" 
                    value={formData.stockQty || 0}
                    onChange={(e) => setFormData({...formData, stockQty: parseInt(e.target.value)})}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-[#fcfbf7]"
                 />
             </div>
        </div>
    </div>
  );

  // ------------------------------------------------------------------
  // Overview Content (Right Pane)
  // ------------------------------------------------------------------
  const renderOverviewContent = (item: Item) => (
    <div className="flex flex-col h-full animate-fade-in">
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="grid grid-cols-2 gap-6 max-w-4xl">
                {/* General Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex items-center space-x-2 mb-4 text-gray-500">
                        <Info size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-wider">General Information</h3>
                     </div>
                     <div className="space-y-4">
                         <div className="flex justify-between border-b border-gray-50 pb-2">
                             <span className="text-sm text-gray-600">Category</span>
                             <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-50 pb-2">
                             <span className="text-sm text-gray-600">Unit</span>
                             <span className="text-sm font-medium text-gray-900">{item.unit}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-50 pb-2">
                             <span className="text-sm text-gray-600">Supplier</span>
                             <span className="text-sm font-medium text-gray-900">{item.supplier || '-'}</span>
                         </div>
                     </div>
                </div>

                {/* Stock Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex items-center space-x-2 mb-4 text-gray-500">
                        <Package size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-wider">Stock Status</h3>
                     </div>
                     <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                             <span className="text-sm text-gray-600">Quantity on Hand</span>
                             <span className={`text-xl font-bold ${item.stockQty < 50 ? 'text-red-600' : 'text-green-600'}`}>
                                 {item.stockQty}
                             </span>
                         </div>
                         <div className="flex justify-between items-center pt-1">
                             <span className="text-sm text-gray-600">Status</span>
                             <span className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-bold uppercase ${item.stockQty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {item.stockQty > 0 ? <CheckCircle size={12}/> : <X size={12}/>}
                                 <span>{item.stockQty > 0 ? 'In Stock' : 'Out of Stock'}</span>
                             </span>
                         </div>
                     </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-2">
                     <div className="flex items-center space-x-2 mb-4 text-gray-500">
                        <Tag size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-wider">Pricing & Cost</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                         <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                             <span className="text-xs text-primary font-bold uppercase block mb-1">Selling Price</span>
                             <span className="text-2xl font-bold text-gray-800">LKR {item.price.toLocaleString()}</span>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Cost Price</span>
                             <span className="text-xl font-medium text-gray-600">LKR {item.cost.toLocaleString()}</span>
                         </div>
                     </div>
                </div>

                {/* Description */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-2">
                     <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Description</h3>
                     <p className="text-sm text-gray-700 leading-relaxed">
                         {item.description || "No description available for this item."}
                     </p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderTransactionsContent = (item: Item) => (
      <div className="flex flex-col h-full items-center justify-center text-gray-400 p-8 space-y-4">
          <div className="p-4 bg-gray-50 rounded-full">
              <List size={40} />
          </div>
          <div className="text-center">
              <h3 className="font-bold text-gray-600">No Sales History</h3>
              <p className="text-sm max-w-xs mx-auto">This item hasn't been added to any invoices yet.</p>
          </div>
      </div>
  );

  const renderHistoryContent = (item: Item) => (
      <div className="flex flex-col h-full items-center justify-center text-gray-400 p-8 space-y-4">
          <div className="p-4 bg-gray-50 rounded-full">
              <HistoryIcon size={40} />
          </div>
          <div className="text-center">
              <h3 className="font-bold text-gray-600">Stock History</h3>
              <p className="text-sm max-w-xs mx-auto">View the audit log of stock movements for this item.</p>
          </div>
      </div>
  );

  // ------------------------------------------------------------------
  // View 3: Full Page GRN Form with Split Layout (Supplier Mgmt)
  // ------------------------------------------------------------------
  if (viewMode === 'GRN') {
    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in">
             {/* Header */}
             <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-none">
                  <div className="flex items-center space-x-4">
                      <button onClick={() => setViewMode('LIST')} className="text-gray-500 hover:text-gray-800 transition">
                          <ArrowLeft size={24} />
                      </button>
                      <div>
                          <h2 className="text-2xl font-bold text-gray-800">Goods Received Note (GRN)</h2>
                          <p className="text-sm text-gray-500">Receive Stock(GRN)</p>
                      </div>
                  </div>
             </div>

             {/* Split Content */}
             <div className="flex flex-1 min-h-0">
                 {/* LEFT PANE: GRN ENTRY FORM (70%) */}
                 <div className="w-[70%] border-r border-gray-200 overflow-y-auto p-8 bg-white">
                     <div className="max-w-4xl mx-auto space-y-6">
                         {/* ... Existing GRN Code ... */}
                         {/* Top Section: Date & Supplier */}
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-2 gap-8">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                 <input 
                                    type="date"
                                    value={grnDate}
                                    onChange={(e) => setGrnDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-[#fcfbf7]"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                                 <div className="relative">
                                     <select 
                                        value={grnSupplier}
                                        onChange={(e) => setGrnSupplier(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-[#fcfbf7] appearance-none"
                                     >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                     </select>
                                     <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                                 </div>
                             </div>
                         </div>

                         {/* Item Entry Section */}
                         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Add Items to Stock</h3>
                             <div className="grid grid-cols-12 gap-4 items-end">
                                 {/* Item Select */}
                                 <div className="col-span-4">
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item</label>
                                     <select 
                                         value={currentGRNItem.itemId}
                                         onChange={(e) => setCurrentGRNItem({ ...currentGRNItem, itemId: e.target.value })}
                                         className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white"
                                     >
                                         <option value="">Select Item</option>
                                         {items.map(item => (
                                             <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
                                         ))}
                                     </select>
                                 </div>

                                 {/* Quantity */}
                                 <div className="col-span-2">
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity</label>
                                     <input 
                                         type="number"
                                         min="1"
                                         value={currentGRNItem.quantity}
                                         onChange={(e) => setCurrentGRNItem({ ...currentGRNItem, quantity: parseInt(e.target.value) || 0 })}
                                         className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white"
                                     />
                                 </div>

                                 {/* Unit Cost */}
                                 <div className="col-span-2">
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Unit Cost</label>
                                     <input 
                                         type="number"
                                         min="0"
                                         value={currentGRNItem.unitCost}
                                         onChange={(e) => setCurrentGRNItem({ ...currentGRNItem, unitCost: parseFloat(e.target.value) || 0 })}
                                         className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white"
                                     />
                                 </div>

                                 {/* Discount */}
                                 <div className="col-span-2">
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Discount</label>
                                     <input 
                                         type="number"
                                         min="0"
                                         value={currentGRNItem.discount}
                                         onChange={(e) => setCurrentGRNItem({ ...currentGRNItem, discount: parseFloat(e.target.value) || 0 })}
                                         className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white"
                                     />
                                 </div>

                                 {/* Add Button */}
                                 <div className="col-span-2">
                                     <button 
                                         onClick={addLineToGRN}
                                         disabled={!currentGRNItem.itemId}
                                         className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-bold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         Add Line
                                     </button>
                                 </div>
                             </div>
                         </div>

                         {/* List of Added Items */}
                         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[200px]">
                             <table className="w-full text-left">
                                 <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase border-b">
                                     <tr>
                                         <th className="px-6 py-4">Item Details</th>
                                         <th className="px-6 py-4 text-center">Quantity</th>
                                         <th className="px-6 py-4 text-right">Unit Cost</th>
                                         <th className="px-6 py-4 text-right">Discount</th>
                                         <th className="px-6 py-4 text-right">Total</th>
                                         <th className="px-6 py-4 text-center">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {grnLines.length === 0 ? (
                                         <tr>
                                             <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                                 No items added to this GRN yet. Add items above.
                                             </td>
                                         </tr>
                                     ) : (
                                         grnLines.map((line, index) => (
                                             <tr key={index} className="hover:bg-gray-50">
                                                 <td className="px-6 py-4">
                                                     <div className="font-bold text-gray-800">{line.name}</div>
                                                     <div className="text-xs text-gray-500">{line.sku}</div>
                                                 </td>
                                                 <td className="px-6 py-4 text-center font-medium">{line.quantity}</td>
                                                 <td className="px-6 py-4 text-right text-gray-600">{line.unitCost.toLocaleString()}</td>
                                                 <td className="px-6 py-4 text-right text-gray-600">{line.discount.toLocaleString()}</td>
                                                 <td className="px-6 py-4 text-right font-bold text-gray-800">{line.total.toLocaleString()}</td>
                                                 <td className="px-6 py-4 text-center">
                                                     <button 
                                                         onClick={() => removeLineFromGRN(index)}
                                                         className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                                     >
                                                         <Trash2 size={16} />
                                                     </button>
                                                 </td>
                                             </tr>
                                         ))
                                     )}
                                 </tbody>
                             </table>
                         </div>

                         {/* Footer Summary & Actions */}
                         <div className="flex justify-end items-center space-x-6 pt-4">
                             <div className="text-right mr-4">
                                 <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Grand Total</span>
                                 <span className="text-3xl font-bold text-gray-800">LKR {grnGrandTotal.toLocaleString()}</span>
                             </div>
                             <div className="flex space-x-3">
                                 <button 
                                     onClick={() => setViewMode('LIST')}
                                     className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                                 >
                                     Cancel
                                 </button>
                                 <button 
                                     onClick={confirmGRN}
                                     disabled={grnLines.length === 0}
                                     className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                 >
                                     <CheckCircle size={20} />
                                     <span>Confirm GRN</span>
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* RIGHT PANE: SUPPLIER MANAGEMENT (30%) */}
                 <div className="w-[30%] bg-gray-50 flex flex-col border-l border-gray-200">
                     {/* ... Existing Supplier Sidebar Code ... */}
                     <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
                         <h3 className="font-bold text-gray-800">Supplier Directory</h3>
                         <button 
                            onClick={() => { setIsAddingSupplier(true); setSupplierForm({}); }}
                            className="text-primary hover:bg-blue-50 p-2 rounded-lg transition text-sm font-bold flex items-center space-x-1"
                         >
                             <Plus size={16} /> <span>New</span>
                         </button>
                     </div>
                     
                     {/* Search */}
                     <div className="p-4 border-b border-gray-200 bg-white">
                         <div className="relative">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                             <input 
                                type="text" 
                                placeholder="Search suppliers..."
                                value={supplierSearch}
                                onChange={(e) => setSupplierSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                             />
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                         {isAddingSupplier ? (
                             <div className="bg-white p-4 rounded-xl shadow-sm border border-primary/30 space-y-3 animate-fade-in-up">
                                 {/* ... Supplier Form ... */}
                                 <h4 className="text-sm font-bold text-primary mb-2">New Supplier</h4>
                                 <input 
                                     placeholder="Company Name" 
                                     className="w-full text-sm border p-2 rounded bg-gray-50"
                                     value={supplierForm.name || ''}
                                     onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                                 />
                                 <input 
                                     placeholder="Contact Person" 
                                     className="w-full text-sm border p-2 rounded bg-gray-50"
                                     value={supplierForm.contactPerson || ''}
                                     onChange={(e) => setSupplierForm({...supplierForm, contactPerson: e.target.value})}
                                 />
                                 <input 
                                     placeholder="Address" 
                                     className="w-full text-sm border p-2 rounded bg-gray-50"
                                     value={supplierForm.address || ''}
                                     onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                                 />
                                 <div className="grid grid-cols-2 gap-2">
                                     <input 
                                        placeholder="Phone" 
                                        className="w-full text-sm border p-2 rounded bg-gray-50"
                                        value={supplierForm.phone || ''}
                                        onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                                    />
                                    <input 
                                        placeholder="Mobile" 
                                        className="w-full text-sm border p-2 rounded bg-gray-50"
                                        value={supplierForm.mobile || ''}
                                        onChange={(e) => setSupplierForm({...supplierForm, mobile: e.target.value})}
                                    />
                                 </div>
                                 <input 
                                     placeholder="Email" 
                                     className="w-full text-sm border p-2 rounded bg-gray-50"
                                     value={supplierForm.email || ''}
                                     onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                                 />
                                 <div className="flex justify-end space-x-2 pt-2">
                                     <button 
                                        onClick={() => setIsAddingSupplier(false)}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700"
                                     >
                                         Cancel
                                     </button>
                                     <button 
                                        onClick={handleSaveSupplier}
                                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600"
                                     >
                                         Save Supplier
                                     </button>
                                 </div>
                             </div>
                         ) : (
                             filteredSuppliers.map(supplier => (
                                 <div key={supplier.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                                     {/* ... Supplier Card ... */}
                                     <div className="flex justify-between items-start mb-2">
                                         <h4 className="font-bold text-gray-800">{supplier.name}</h4>
                                         <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                                             <button 
                                                onClick={() => { setIsAddingSupplier(true); setSupplierForm(supplier); }}
                                                className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary"
                                             >
                                                 <Edit size={14} />
                                             </button>
                                         </div>
                                     </div>
                                     
                                     <div className="space-y-1.5">
                                         <div className="flex items-center space-x-2 text-gray-500 text-xs">
                                             <User size={12} /> <span>{supplier.contactPerson}</span>
                                         </div>
                                         <div className="flex items-center space-x-2 text-gray-500 text-xs">
                                             <Phone size={12} /> <span>{supplier.phone}</span>
                                         </div>
                                         <div className="flex items-center space-x-2 text-gray-500 text-xs">
                                             <Mail size={12} /> <span className="truncate">{supplier.email}</span>
                                         </div>
                                         <div className="flex items-start space-x-2 text-gray-500 text-xs">
                                             <MapPin size={12} className="mt-0.5 flex-none" /> <span className="line-clamp-2">{supplier.address}</span>
                                         </div>
                                     </div>

                                     <button 
                                        onClick={() => setGrnSupplier(supplier.name)}
                                        className="w-full mt-3 py-1.5 text-xs font-bold border border-primary/20 text-primary rounded-lg hover:bg-blue-50 transition"
                                     >
                                         Select for GRN
                                     </button>
                                 </div>
                             ))
                         )}
                     </div>
                 </div>
             </div>
        </div>
    );
  }

  // ------------------------------------------------------------------
  // View 1: Full Page Create/Edit Item
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
                          {formData.id ? 'Edit Item' : 'New Item'}
                      </h2>
                  </div>
                  {formData.id && (
                       <button 
                            onClick={handleDelete}
                            className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition text-sm font-medium"
                        >
                            <Trash2 size={16} />
                            <span>Delete Item</span>
                        </button>
                  )}
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-10 bg-white">
                  <form onSubmit={handleSave}>
                      {renderItemForm()}
                      
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
      
      {/* LEFT PANE: Header + Filters + List */}
      <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-in-out border border-gray-100 gap-4
            ${selectedItem ? 'w-[30%] min-w-[320px] bg-white' : 'w-full'}
      `}>
          
          {/* Header - Moved inside Left Pane */}
          <div className="bg-white p-4 rounded-t-xl z-20 relative flex-none">
                <div className="flex justify-between items-center mb-3">
                    <div className={`${selectedItem ? 'hidden xl:block' : 'block'}`}>
                        <h2 className="text-xl font-bold text-gray-800">Inventory</h2>
                        <p className={`text-sm text-gray-500 ${selectedItem ? 'hidden' : 'block'}`}>Manage stock items</p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..." 
                                className={`pl-9 pr-3 py-2 bg-gray-800 text-white placeholder-gray-400 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all
                                    ${selectedItem ? 'w-full' : 'w-64'}
                                `}
                            />
                        </div>
                        
                        <div className={`flex items-center space-x-2 ${selectedItem ? 'hidden' : 'flex'}`}>
                            <button 
                                onClick={handleGRNOpen}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition shadow-md font-medium"
                            >
                                <Truck size={18} />
                                <span>Receive</span>
                            </button>

                            <button 
                                onClick={handleCreateOpen}
                                className="bg-primary hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition shadow-md font-medium"
                            >
                                <Plus size={18} />
                                <span>New</span>
                            </button>
                        </div>
                         
                         {/* Compact Menu for Split View */}
                         <div className={`relative ${selectedItem ? 'block' : 'block'}`}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                className={`p-2 rounded-lg transition ${isMenuOpen ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                            >
                                <MoreHorizontal size={20} />
                            </button>
                            
                            {/* Actions Dropdown */}
                            {isMenuOpen && (
                                <div className="absolute right-0 top-12 w-60 bg-white rounded-lg shadow-xl z-50 border border-gray-100 py-2 animate-fade-in text-sm" onClick={(e) => e.stopPropagation()}>
                                    {selectedItem && (
                                        <>
                                             <button onClick={handleGRNOpen} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2">
                                                <Truck size={14} /> <span>Receive Stock (GRN)</span>
                                            </button>
                                            <button onClick={handleCreateOpen} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2">
                                                <Plus size={14} /> <span>New Item</span>
                                            </button>
                                            <div className="border-t my-1"></div>
                                        </>
                                    )}

                                    {/* Sort By Submenu */}
                                    <div className="relative group">
                                    <button className="w-full text-left px-4 py-2 bg-blue-500 text-white flex justify-between items-center hover:bg-blue-600 transition">
                                        <span className="font-medium">Sort by</span>
                                        <ChevronRight size={14} />
                                    </button>
                                    <div className="absolute right-full top-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block py-1 mr-1">
                                        <button onClick={() => handleSort('name', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Name (A-Z)</button>
                                        <button onClick={() => handleSort('sku', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">SKU (A-Z)</button>
                                        <button onClick={() => handleSort('price', 'desc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Price (High-Low)</button>
                                        <button onClick={() => handleSort('price', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Price (Low-High)</button>
                                        <button onClick={() => handleSort('stockQty', 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Stock (Low-High)</button>
                                        <button onClick={() => handleSort('stockQty', 'desc')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Stock (High-Low)</button>
                                    </div>
                                    </div>

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

                {/* Category Pills Toolbar */}
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide flex-none">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap shadow-sm border
                                ${activeCategory === cat 
                                    ? 'bg-gray-800 text-white border-gray-800' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left table-fixed">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0 z-10 border-y border-gray-100">
                    <tr>
                        <th className={`px-4 py-3 w-16 ${selectedItem ? 'text-center' : ''}`}>
                            {selectedItem ? '' : 'Image'}
                        </th>
                        <th className="px-4 py-3 w-auto">Item Name / SKU</th>
                        
                        {/* Hide columns when collapsed */}
                        <th className={`px-4 py-3 ${selectedItem ? 'hidden' : ''}`}>Category</th>
                        <th className={`px-4 py-3 ${selectedItem ? 'hidden' : ''}`}>Supplier</th>
                        <th className={`px-4 py-3 text-right ${selectedItem ? 'hidden' : ''}`}>Cost</th>
                        <th className={`px-4 py-3 text-right font-medium ${selectedItem ? 'hidden' : ''}`}>Price</th>
                        
                        <th className={`px-4 py-3 text-center ${selectedItem ? 'w-16' : ''}`}>Stock</th>
                        <th className={`px-4 py-3 text-center ${selectedItem ? 'hidden' : ''}`}>Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredItems.map(item => (
                            <tr 
                                key={item.id} 
                                onClick={() => setSelectedItem(item)}
                                className={`transition cursor-pointer group
                                    ${selectedItem?.id === item.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-sky-50 border-l-4 border-transparent'}
                                `}
                            >
                                <td className="px-4 py-3">
                                    <div className="h-10 w-10 bg-gray-200 rounded-md overflow-hidden mx-auto">
                                        {item.imageUrl ? (
                                             <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 overflow-hidden">
                                    <div className="font-medium text-gray-800 truncate">{item.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{item.sku}</div>
                                </td>
                                
                                {/* Collapsible Columns */}
                                <td className={`px-4 py-3 text-gray-600 ${selectedItem ? 'hidden' : ''}`}>{item.category}</td>
                                <td className={`px-4 py-3 text-gray-600 ${selectedItem ? 'hidden' : ''}`}>{item.supplier || '-'}</td>
                                <td className={`px-4 py-3 text-right text-gray-600 ${selectedItem ? 'hidden' : ''}`}>{item.cost}</td>
                                <td className={`px-4 py-3 text-right font-medium text-gray-800 ${selectedItem ? 'hidden' : ''}`}>{item.price}</td>
                                
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold
                                        ${item.stockQty < 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                                    `}>
                                        {item.stockQty}
                                    </span>
                                </td>
                                
                                {/* Action Column (Edit Button) */}
                                <td className={`px-4 py-3 text-center ${selectedItem ? 'hidden' : ''}`}>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleEditFullPage(item); 
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition"
                                        title="Edit Item"
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

      {/* Right Pane: Overview (70% Width) */}
      {selectedItem && (
        <div className="w-[70%] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col animate-fade-in-right overflow-hidden relative z-30">
            {/* Header - Compact */}
            <div className="bg-white p-3 border-b border-gray-100 flex justify-between items-center flex-none">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
                        {selectedItem.imageUrl ? (
                            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="h-full w-full object-cover" />
                        ) : (
                            <ImageIcon className="text-gray-400" size={20} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-tight">{selectedItem.name}</h2>
                        <div className="flex items-center space-x-2 text-gray-500 text-xs">
                            <Tag size={12} />
                            <span className="font-mono tracking-wide">{selectedItem.sku}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Toolbar / Actions */}
            <div className="bg-white px-4 py-2 flex items-center space-x-1 border-b border-gray-100 flex-none overflow-x-auto">
                <button onClick={() => handleEditFullPage(selectedItem)} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                    <Edit size={14} /> <span>Edit</span>
                </button>
                <button onClick={handleCloneItem} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-primary transition whitespace-nowrap">
                    <Copy size={14} /> <span>Clone</span>
                </button>
                <button onClick={handleDeleteItemAction} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-red-50 text-sm font-medium text-gray-600 hover:text-red-600 transition whitespace-nowrap">
                    <Trash2 size={14} /> <span>Delete</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white px-6 flex space-x-6 border-b border-gray-100 flex-none">
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

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'OVERVIEW' && renderOverviewContent(selectedItem)}
                {activeTab === 'TRANSACTIONS' && renderTransactionsContent(selectedItem)}
                {activeTab === 'HISTORY' && renderHistoryContent(selectedItem)}
            </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
