
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Upload, Image as ImageIcon, Lock, LogOut, CheckCircle, AlertCircle, HardDrive, Cloud, Sparkles, Loader, ChevronLeft } from 'lucide-react';
import { Product } from '../types';
import { ProductService } from '../services/productService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { analyzeProductImage } from '../services/geminiService';

interface AdminDashboardProps {
  onClose: () => void;
  onUpdate: () => void; // Trigger refresh in parent
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  
  // Editing State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [useLocalMode, setUseLocalMode] = useState(false);

  // Initial Load
  useEffect(() => {
    const checkAuth = sessionStorage.getItem('admin_auth');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
      setUseLocalMode(!isSupabaseConfigured());
      loadProducts();
    }
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await ProductService.getAll();
    setProducts(data);
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setUseLocalMode(!isSupabaseConfigured());
      loadProducts();
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    onClose();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsLoading(true);
      try {
        const updated = await ProductService.delete(id);
        setProducts(updated);
        onUpdate();
      } catch (e: any) {
        alert("Error: " + e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Reset file selection when opening/closing modal
  useEffect(() => {
    if (!editingProduct) {
      setSelectedFile(null);
    }
  }, [editingProduct]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct || !editingProduct.name) {
      alert("Product name is required.");
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = editingProduct.image || 'https://via.placeholder.com/400';

      // 1. Upload new image if file selected
      if (selectedFile) {
        finalImageUrl = await ProductService.uploadImage(selectedFile);
      }

      // 2. Prepare Product Object
      const productToSave = {
        ...editingProduct,
        id: editingProduct.id || Date.now().toString(),
        inStock: editingProduct.inStock ?? true,
        price: editingProduct.price || '€0.00',
        category: editingProduct.category || 'Uncategorized',
        image: finalImageUrl,
        description: editingProduct.description || '',
        dimensions: editingProduct.dimensions || 'N/A'
      } as Product;

      // 3. Save
      const updated = await ProductService.save(productToSave);
      
      setProducts(updated);
      setEditingProduct(null);
      setSelectedFile(null);
      onUpdate();
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(`Save Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditingProduct(prev => ({ ...prev, image: previewUrl }));
    }
  };

  // --- PRICE FORMATTING HANDLERS ---
  const handlePriceFocus = () => {
    if (!editingProduct?.price) return;
    const raw = editingProduct.price.replace(/[€\s]/g, '');
    setEditingProduct(prev => ({ ...prev, price: raw }));
  };

  const handlePriceBlur = () => {
    if (!editingProduct?.price) return;
    let val = editingProduct.price;
    val = val.replace(/[€\sA-Za-z]/g, '');
    if (val.includes(',')) {
      val = val.replace(/\./g, '').replace(',', '.');
    }
    const numericVal = parseFloat(val);
    if (!isNaN(numericVal)) {
        setEditingProduct(prev => ({ 
            ...prev, 
            price: `€${numericVal.toFixed(2)}` 
        }));
    }
  };

  // --- AI Auto-Fill Logic ---
  const handleAutoAnalyze = async () => {
    if (!selectedFile && !editingProduct?.image) return;

    setIsAnalyzing(true);
    try {
        let base64Data = '';
        if (selectedFile) {
            base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const res = reader.result as string;
                    resolve(res.split(',')[1]);
                };
                reader.readAsDataURL(selectedFile);
            });
        } 
        else if (editingProduct?.image) {
             try {
                 const res = await fetch(editingProduct.image);
                 const blob = await res.blob();
                 base64Data = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const res = reader.result as string;
                        resolve(res.split(',')[1]);
                    };
                    reader.readAsDataURL(blob);
                });
             } catch (fetchErr) {
                 throw new Error("Cannot analyze external URL directly. Please upload the file from your computer.");
             }
        }

        const aiResult = await analyzeProductImage(base64Data);
        
        if (aiResult) {
            setEditingProduct(prev => ({
                ...prev,
                name: aiResult.name || prev?.name,
                category: aiResult.category || prev?.category,
                description: aiResult.description || prev?.description
            }));
        }

    } catch (err: any) {
        console.error("AI Analysis failed:", err);
        alert(err.message || "Failed to analyze image.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3E2723]/90 backdrop-blur-md p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full"
        >
          <div className="flex justify-center mb-6 text-[#8D6E63]">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-[#3E2723] text-center mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63] focus:outline-none text-[#3E2723]"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex gap-2">
                <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-[#8D6E63] hover:bg-[#FAFAF9] rounded-lg transition-colors"
                >
                Cancel
                </button>
                <button 
                type="submit"
                className="flex-1 bg-[#3E2723] text-white py-3 rounded-lg font-bold hover:bg-[#5D4037] transition-colors"
                >
                Login
                </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAFAF9] flex flex-col">
      {/* Header */}
      <header className="bg-[#3E2723] text-white px-4 md:px-6 py-4 flex justify-between items-center shadow-md flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <h2 className="text-lg md:text-xl font-bold tracking-wide">Studio Inventory</h2>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-bold w-fit ${useLocalMode ? 'bg-amber-500 text-[#3E2723]' : 'bg-green-600 text-white'}`}>
            {useLocalMode ? <HardDrive className="w-3 h-3"/> : <Cloud className="w-3 h-3"/>}
            {useLocalMode ? 'LOCAL' : 'CLOUD'}
          </span>
        </div>
        <div className="flex gap-3 md:gap-4">
           <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#D7CCC8] hover:text-white transition-colors text-sm"
           >
             <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Logout</span>
           </button>
           <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-10 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {useLocalMode && (
            <div className="mb-6 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900 text-sm md:text-base">
               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
               <div>
                 <h4 className="font-bold">Using Local Storage</h4>
                 <p className="mt-1 opacity-90">
                   Supabase is not configured. Changes saved to browser only.
                 </p>
               </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-[#3E2723]">Product List</h3>
            <button 
              onClick={() => {
                 setEditingProduct({ inStock: true });
                 setSelectedFile(null);
              }}
              className="flex items-center gap-2 bg-[#8D6E63] hover:bg-[#6D4C41] text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg transition-colors text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Add New Product</span><span className="md:hidden">Add</span>
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {products.map((p) => (
                <motion.div 
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-[#E7E5E4] overflow-hidden group flex md:block h-32 md:h-auto"
                >
                  <div className="relative w-32 md:w-full h-full md:h-48 bg-[#EFEBE9] flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-[10px] md:text-xs font-bold uppercase text-center">Out of Stock</span>
                      </div>
                    )}
                    {/* Desktop Hover Actions */}
                    <div className="hidden md:flex absolute top-2 right-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingProduct(p)} className="p-2 bg-white text-[#3E2723] rounded-full shadow hover:bg-[#8D6E63] hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-white text-red-500 rounded-full shadow hover:bg-red-500 hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-[#3E2723] truncate pr-2 text-sm md:text-base">{p.name}</h4>
                            <span className="text-sm font-medium text-[#8D6E63] whitespace-nowrap">{p.price}</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-[#A1887F] uppercase tracking-wider mb-2">{p.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#5D4037]">
                        {p.inStock ? (
                            <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3"/> <span className="hidden md:inline">Stock Active</span></span>
                        ) : (
                            <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-3 h-3"/> Unavailable</span>
                        )}
                        </div>
                        {/* Mobile Actions */}
                        <div className="flex md:hidden gap-3">
                            <button onClick={() => setEditingProduct(p)} className="text-[#8D6E63]"><Edit2 className="w-5 h-5"/></button>
                            <button onClick={() => handleDelete(p.id)} className="text-red-400"><Trash2 className="w-5 h-5"/></button>
                        </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal - Full Screen on Mobile */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[110] bg-black/50 md:backdrop-blur-sm flex items-end md:items-center justify-center md:p-4">
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-white md:rounded-2xl w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 bg-white border-b border-[#E7E5E4] px-4 py-4 md:px-8 md:py-5 flex justify-between items-center z-10 safe-top">
                <div className="flex items-center gap-2 md:hidden" onClick={() => setEditingProduct(null)}>
                    <ChevronLeft className="w-6 h-6 text-[#A1887F]"/>
                    <span className="text-[#A1887F]">Back</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#3E2723] flex-1 text-center md:text-left">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setEditingProduct(null)} className="text-[#A1887F] hover:text-[#3E2723]">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 pb-24 md:pb-8">
                
                {/* Left Col: Image & AI */}
                <div className="space-y-4 md:space-y-6">
                  <div className="aspect-square bg-[#FAFAF9] rounded-xl border-2 border-dashed border-[#D7CCC8] flex flex-col items-center justify-center overflow-hidden relative group">
                    {editingProduct.image ? (
                      <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4 text-[#8D6E63]">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image selected</p>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                      <label className="cursor-pointer bg-white text-[#3E2723] px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-[#F5F5F5] flex items-center gap-2">
                        <Upload className="w-4 h-4" /> 
                        {selectedFile ? 'Change' : 'Upload'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    {/* Mobile always show upload button slightly transparent if no image */}
                    {!editingProduct.image && (
                         <label className="md:hidden absolute inset-0 flex items-center justify-center z-10">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                         </label>
                    )}
                  </div>
                  
                  {/* AI Analysis Button */}
                  <button
                    type="button"
                    onClick={handleAutoAnalyze}
                    disabled={isAnalyzing || (!selectedFile && !editingProduct.image)}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm
                        ${isAnalyzing || (!selectedFile && !editingProduct.image)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                        }`}
                  >
                     {isAnalyzing ? (
                         <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</>
                     ) : (
                         <><Sparkles className="w-4 h-4" /> AI Auto-Fill Info</>
                     )}
                  </button>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">Or Image URL</label>
                    <input 
                      type="text" 
                      value={!selectedFile ? editingProduct.image || '' : ''}
                      onChange={(e) => {
                        setSelectedFile(null);
                        setEditingProduct({...editingProduct, image: e.target.value})
                      }}
                      placeholder="https://..."
                      className="w-full p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63] text-sm"
                      disabled={!!selectedFile}
                    />
                  </div>
                </div>

                {/* Right Col: Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">Name *</label>
                        <input 
                        required
                        type="text" 
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">Category</label>
                        <input 
                        required
                        type="text" 
                        value={editingProduct.category || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63]"
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">Price</label>
                        <input 
                        required
                        type="text" 
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                        onFocus={handlePriceFocus}
                        onBlur={handlePriceBlur}
                        placeholder="120"
                        className="w-full p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">Dimensions</label>
                        <input 
                        type="text" 
                        value={editingProduct.dimensions || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, dimensions: e.target.value})}
                        className="w-full p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63]"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      rows={4}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="w-full p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63] resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
                    <div 
                        onClick={() => setEditingProduct({...editingProduct, inStock: !editingProduct.inStock})}
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${editingProduct.inStock ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${editingProduct.inStock ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-[#5D4037]">
                        {editingProduct.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {/* Spacer for sticky buttons on mobile */}
                  <div className="h-12 md:hidden"></div>
                </div>

                {/* Sticky Action Buttons */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E7E5E4] flex gap-3 md:relative md:border-t-0 md:bg-transparent md:p-0 md:pt-4 z-20 safe-bottom">
                    <button 
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="flex-1 py-3 text-[#8D6E63] hover:bg-[#FAFAF9] rounded-lg transition-colors font-bold border border-[#E7E5E4] md:border-0"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] bg-[#3E2723] hover:bg-[#5D4037] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                  </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
