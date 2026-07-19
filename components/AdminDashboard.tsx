
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, EyeOff, Upload, Image as ImageIcon, Lock, LogOut, HardDrive, Cloud, Sparkles, Loader, Database, Globe, Tag, DollarSign, Box, Link as LinkIcon, AlertTriangle, CheckCircle, Wrench, AlertCircle, Film, Trash2 } from 'lucide-react';
import { Product, GalleryItem } from '../types';
import { ProductService } from '../services/productService';
import { GalleryService } from '../services/galleryService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { analyzeProductImage } from '../services/geminiService';

interface AdminDashboardProps {
  onClose: () => void;
  onUpdate: () => void;
}

// Toast Interface
interface ToastMsg {
    id: number;
    message: string;
    type: 'success' | 'error';
}

// Utility to compress image before sending to AI
const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Canvas context missing"));
                    return;
                }

                // Resize logic: Max 800px
                const MAX_SIZE = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG 60% quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                // Remove data:image/jpeg;base64, prefix
                resolve(dataUrl.split(',')[1]);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Tabs: 'products' | 'gallery'
  const [activeTab, setActiveTab] = useState<'products' | 'gallery'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  
  // Gallery URL State
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  // Editing State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [useLocalMode, setUseLocalMode] = useState(false);
  
  // UX States
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Initial Load
  useEffect(() => {
    const checkAuth = sessionStorage.getItem('admin_auth');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
      setUseLocalMode(!isSupabaseConfigured());
      loadData();
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const pData = await ProductService.getAll();
    setProducts(pData);
    const gData = await GalleryService.getAll();
    setGalleryImages(gData);
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '111') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setUseLocalMode(!isSupabaseConfigured());
      loadData();
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

  const showToast = (message: string, type: 'success' | 'error') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  // --- PRODUCT LOGIC ---

  const handleDelete = async (id: string) => {
    const previousProducts = [...products];
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeletingId(id); 
    
    try {
      await ProductService.delete(id); 
      showToast('Product hidden successfully', 'success');
      onUpdate();
    } catch (e: any) {
      setProducts(previousProducts);
      showToast(`Failed to hide: ${e.message}`, 'error');
      if (e.message.includes("is_hidden") || e.message.includes("column") || e.message.includes("PGRST204")) {
          setShowRepairModal(true);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setIsLoading(true);
    try {
      let finalImageUrl = editingProduct.image || 'https://via.placeholder.com/400';
      if (selectedFile) {
        finalImageUrl = await ProductService.uploadImage(selectedFile);
      }

      const productToSave = {
        ...editingProduct,
        id: editingProduct.id || '',
        inStock: editingProduct.inStock ?? true,
        price: editingProduct.price || '€0.00',
        image: finalImageUrl,
        sku: editingProduct.sku || '',
        name: editingProduct.name,
        name_it: editingProduct.name_it || '',
        category: editingProduct.category || 'General',
        category_it: editingProduct.category_it || 'Generale',
        description: editingProduct.description || '',
        description_it: editingProduct.description_it || '',
      } as Product;

      await ProductService.save(productToSave);
      
      showToast('Product saved successfully', 'success');
      loadData();
      setEditingProduct(null);
      setSelectedFile(null);
      onUpdate();
    } catch (err: any) {
      showToast(`Save Failed: ${err.message}`, 'error');
      if (err.message.includes("column")) {
          setShowRepairModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- GALLERY LOGIC ---

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      setIsLoading(true);
      try {
          await GalleryService.save(file);
          const updated = await GalleryService.getAll();
          setGalleryImages(updated);
          showToast('Image uploaded to ticker', 'success');
      } catch (err: any) {
          showToast('Gallery Upload Failed: ' + err.message, 'error');
          if (err.message.includes('relation "gallery" does not exist') || err.code === '42P01') {
             setShowRepairModal(true);
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handleGalleryUrlAdd = async () => {
    if (!galleryUrlInput.trim()) return;
    setIsLoading(true);
    try {
        await GalleryService.save(galleryUrlInput);
        const updated = await GalleryService.getAll();
        setGalleryImages(updated);
        setGalleryUrlInput('');
        showToast('Image link added', 'success');
    } catch (err: any) {
        showToast('Failed to add link: ' + err.message, 'error');
        if (err.message.includes('relation "gallery" does not exist') || err.code === '42P01') {
             setShowRepairModal(true);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
      const prev = [...galleryImages];
      setGalleryImages(prev => prev.filter(i => i.id !== id)); // Optimistic

      try {
          await GalleryService.delete(id);
          showToast('Image removed', 'success');
      } catch (err: any) {
          setGalleryImages(prev);
          showToast('Failed to remove: ' + err.message, 'error');
      }
  };

  // --- COMMON LOGIC ---

  const handleSeedData = async () => {
      if(confirm("Import sample data to database?")) {
          setIsLoading(true);
          await ProductService.seedInitialData();
          loadData();
          setIsLoading(false);
          showToast('Sample data imported', 'success');
      }
  }

  // --- AI Logic ---
  const handleAutoAnalyze = async () => {
    if (!selectedFile && !editingProduct?.image) return;
    setIsAnalyzing(true);
    try {
        let base64Data = '';
        if (selectedFile) {
            base64Data = await compressImage(selectedFile);
        } else if (editingProduct?.image) {
             try {
                 const res = await fetch(editingProduct.image);
                 const blob = await res.blob();
                 const file = new File([blob], "temp.jpg", { type: "image/jpeg" });
                 base64Data = await compressImage(file);
             } catch (fetchErr) {
                 console.error(fetchErr);
                 throw new Error("Cannot analyze this image URL (CORS Blocked). Please upload the file instead.");
             }
        }

        const aiResult = await analyzeProductImage(base64Data);
        if (aiResult) {
            setEditingProduct(prev => ({
                ...prev,
                name: aiResult.name || prev?.name,
                category: aiResult.category || prev?.category,
                category_it: aiResult.category_it || prev?.category_it,
                description: aiResult.description || prev?.description,
                sku: aiResult.sku || prev?.sku,
                name_it: aiResult.name_it || prev?.name_it,
                description_it: aiResult.description_it || prev?.description_it,
            }));
            showToast('AI Analysis Complete', 'success');
        }
    } catch (err: any) {
        showToast("AI Error: " + err.message, 'error');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handlePriceBlur = () => {
      if (!editingProduct?.price) return;
      const cleanPrice = editingProduct.price.replace(/[^0-9.]/g, '');
      const numberValue = parseFloat(cleanPrice);
      if (!isNaN(numberValue)) {
          const formatted = `€${numberValue.toFixed(2)}`;
          setEditingProduct(prev => ({ ...prev, price: formatted }));
      } else {
          setEditingProduct(prev => ({ ...prev, price: '€0.00' }));
      }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3E2723]/90 backdrop-blur-md p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex justify-center mb-6 text-[#8D6E63]"><Lock className="w-12 h-12" /></div>
          <h2 className="text-2xl font-bold text-[#3E2723] text-center mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password"
              className="w-full px-4 py-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] focus:border-[#8D6E63] focus:outline-none" autoFocus />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 text-[#8D6E63] hover:bg-[#FAFAF9] rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-[#3E2723] text-white py-3 rounded-lg font-bold">Login</button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAFAF9] flex flex-col font-sans">
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
              {toasts.map(toast => (
                  <motion.div 
                      key={toast.id}
                      initial={{ opacity: 0, x: 20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[240px] pointer-events-auto ${
                          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                  >
                      {toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                      <span className="font-bold text-sm">{toast.message}</span>
                  </motion.div>
              ))}
          </AnimatePresence>
      </div>

      {/* Header */}
      <header className="bg-[#3E2723] text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-lg z-10 gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
             <h2 className="text-xl font-bold tracking-wide">Studio Inventory</h2>
             <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider w-fit ${useLocalMode ? 'bg-amber-500/90 text-[#3E2723]' : 'bg-green-500/90 text-white'}`}>
                {useLocalMode ? <HardDrive className="w-3 h-3"/> : <Cloud className="w-3 h-3"/>}
             </span>
          </div>

          {/* TABS */}
          <div className="flex bg-[#2D1B15] p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('products')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'products' ? 'bg-[#5D4037] text-white shadow' : 'text-[#8D6E63] hover:text-white'}`}
             >
                Products
             </button>
             <button 
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'gallery' ? 'bg-[#5D4037] text-white shadow' : 'text-[#8D6E63] hover:text-white'}`}
             >
                <Film className="w-3 h-3"/> Ticker Gallery
             </button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
            {!useLocalMode && (
                <button 
                  onClick={() => setShowRepairModal(true)} 
                  className="hidden md:flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-200 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    <Wrench className="w-3 h-3"/> Repair DB
                </button>
            )}

           <button onClick={handleLogout} className="flex items-center gap-2 text-[#D7CCC8] hover:text-white transition-colors text-sm font-medium"><LogOut className="w-4 h-4"/> Logout</button>
           <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5"/></button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#FAFAF9]">
        <div className="max-w-[1600px] mx-auto">
          
          {/* === PRODUCTS VIEW === */}
          {activeTab === 'products' && (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                    <h3 className="text-3xl font-heading font-bold text-[#3E2723]">Products</h3>
                    <p className="text-[#8D6E63] text-sm mt-1">Manage your collection and translations</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {!useLocalMode && products.length === 0 && (
                            <button onClick={handleSeedData} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-all font-medium text-sm">
                                <Database className="w-4 h-4" /> Import Demo Data
                            </button>
                        )}
                        <button onClick={() => { setEditingProduct({ inStock: true }); setSelectedFile(null); }} 
                            className="flex-1 md:flex-none justify-center items-center gap-2 bg-[#3E2723] text-white px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#5D4037] transition-all duration-300 font-medium">
                        <Plus className="w-5 h-5" /> Add Product
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <AnimatePresence>
                    {products.map((p) => (
                        <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-sm border border-[#E7E5E4] overflow-hidden group hover:shadow-xl transition-all duration-300 flex md:flex-col h-32 md:h-auto relative">
                        
                        {deletingId === p.id && (
                            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-gray-500">
                                <EyeOff className="w-8 h-8 animate-pulse mb-2 text-gray-400" />
                                <span className="text-xs font-bold uppercase tracking-widest">Hiding...</span>
                            </div>
                        )}

                        <div className="w-32 md:w-full h-full md:h-56 bg-[#EFEBE9] flex-shrink-0 relative overflow-hidden">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"/>
                            
                            <div className="hidden md:flex absolute top-3 right-3 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 z-30">
                            <button onClick={() => setEditingProduct(p)} className="p-2.5 bg-white text-[#3E2723] rounded-full shadow-lg hover:bg-[#3E2723] hover:text-white transition-colors border border-gray-100"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(p.id)} title="Hide Product" className="p-2.5 bg-white text-gray-400 rounded-full shadow-lg hover:bg-gray-100 hover:text-gray-600 transition-colors border border-gray-100"><EyeOff className="w-4 h-4" /></button>
                            </div>
                            
                            {!p.inStock && (
                            <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm z-20">OUT OF STOCK</div>
                            )}
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-[#3E2723] truncate pr-2 text-base leading-tight">{p.name}</h4>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-bold text-[#8D6E63] bg-[#EFEBE9] px-2 py-0.5 rounded-md">{p.price}</span>
                                <span className="text-[10px] text-[#A1887F] uppercase tracking-wider truncate">{p.category}</span>
                                </div>
                                {p.sku && <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><Tag className="w-3 h-3"/> {p.sku}</div>}
                            </div>
                            
                            <div className="flex md:hidden gap-4 mt-2 justify-end items-end h-full">
                                <button onClick={() => setEditingProduct(p)} className="text-[#8D6E63] p-2 bg-gray-50 rounded-lg"><Edit2 className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(p.id)} className="text-gray-400 p-2 bg-gray-50 rounded-lg"><EyeOff className="w-5 h-5"/></button>
                            </div>
                        </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
              </>
          )}

          {/* === GALLERY VIEW === */}
          {activeTab === 'gallery' && (
              <>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-3xl font-heading font-bold text-[#3E2723]">Ticker Gallery</h3>
                        <p className="text-[#8D6E63] text-sm mt-1">Images that scroll below the hero section</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto items-center bg-white p-2 rounded-xl shadow-sm border border-[#E7E5E4]">
                        <input 
                            type="text" 
                            placeholder="https://image-url.com..." 
                            className="px-3 py-2 bg-[#FAFAF9] border border-[#E7E5E4] rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/20"
                            value={galleryUrlInput}
                            onChange={(e) => setGalleryUrlInput(e.target.value)}
                        />
                        <button 
                            onClick={handleGalleryUrlAdd}
                            disabled={isLoading || !galleryUrlInput.trim()}
                            className="bg-[#5D4037] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-[#3E2723] transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {isLoading ? <Loader className="animate-spin w-4 h-4"/> : 'Add Link'}
                        </button>
                        
                        <div className="w-px h-6 bg-[#E7E5E4] mx-1"></div>

                        <label className="flex items-center gap-2 bg-[#EFEBE9] text-[#5D4037] px-4 py-2 rounded-lg hover:bg-[#D7CCC8] transition-all duration-300 font-bold text-xs uppercase cursor-pointer whitespace-nowrap">
                            <Upload className="w-4 h-4" />
                            <span>Upload</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} disabled={isLoading} />
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {galleryImages.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                            <p>No images in the ticker yet.</p>
                        </div>
                    )}
                    <AnimatePresence>
                        {galleryImages.map((img) => (
                            <motion.div 
                                key={img.id} 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0 }}
                                className="aspect-square bg-white rounded-xl shadow-sm border border-[#E7E5E4] relative group overflow-hidden"
                            >
                                <img src={img.image_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button 
                                        onClick={() => handleDeleteGallery(img.id)}
                                        className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
              </>
          )}

        </div>
      </div>

      {/* REPAIR MODAL */}
      <AnimatePresence>
          {showRepairModal && (
              <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-6">
                  <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white rounded-2xl p-8 max-w-2xl w-full relative">
                      <button onClick={() => setShowRepairModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
                      <div className="flex items-center gap-3 text-red-600 mb-4">
                          <AlertTriangle className="w-8 h-8"/>
                          <h2 className="text-2xl font-bold">Fix Database Issues</h2>
                      </div>
                      <p className="text-gray-600 mb-6">
                          It seems your database is missing some required tables or columns.
                      </p>
                      
                      <div className="bg-gray-900 rounded-lg p-4 mb-6 relative group overflow-x-auto max-h-60">
                          <pre className="text-green-400 font-mono text-xs md:text-sm">
{`-- 1. Enable Soft Delete
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 2. Create Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT NOT NULL
);
ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;`}
                          </pre>
                      </div>
                      
                      <div className="flex justify-end gap-3">
                          <button onClick={() => setShowRepairModal(false)} className="px-5 py-2 text-gray-500 hover:text-gray-800">Close</button>
                          <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-[#3E2723] text-white rounded-lg font-bold hover:bg-[#5D4037]">
                              Go to Supabase SQL Editor
                          </a>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {/* Edit/Add Modal (Only for Products) */}
      <AnimatePresence>
        {editingProduct && activeTab === 'products' && (
          <div className="fixed inset-0 z-[110] bg-[#2D1B15]/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div 
              initial={{ y: "100%", opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              className="bg-[#FAFAF9] w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-6xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20"
            >
              <div className="flex-shrink-0 bg-white border-b border-[#E7E5E4] px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                   <div className="bg-[#EFEBE9] p-2 rounded-lg text-[#8D6E63]">
                      {editingProduct.id ? <Edit2 className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                   </div>
                   <div>
                      <h3 className="text-lg font-heading font-bold text-[#3E2723]">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                      <p className="text-[11px] text-[#8D6E63] uppercase tracking-wider font-medium">Bilingual Content Management</p>
                   </div>
                </div>
                <button onClick={() => setEditingProduct(null)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-[#5D4037]" /></button>
              </div>
              
              <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* LEFT COLUMN: Visuals & AI */}
                <div className="w-full md:w-[360px] bg-[#EFEBE9]/40 border-r border-[#D7CCC8]/30 flex flex-col relative">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-[#5D4037] uppercase tracking-widest flex items-center gap-2">
                               <ImageIcon className="w-3 h-3"/> Product Visual
                            </label>
                            
                            <div className="aspect-[4/4] bg-white rounded-xl border border-[#D7CCC8] relative group overflow-hidden shadow-sm hover:shadow-md transition-all">
                                {editingProduct.image ? (
                                    <img src={editingProduct.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#A1887F] gap-2 bg-[#FAFAF9]">
                                        <Cloud className="w-8 h-8 opacity-40"/>
                                        <span className="text-xs font-medium opacity-60">No Image</span>
                                    </div>
                                )}
                                
                                <label className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all cursor-pointer flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-white text-[#3E2723] px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 text-xs">
                                        <Upload className="w-3 h-3"/> Upload Photo
                                    </div>
                                    <input type="file" className="hidden" onChange={(e) => {
                                        if(e.target.files?.[0]) { setSelectedFile(e.target.files[0]); setEditingProduct({...editingProduct, image: URL.createObjectURL(e.target.files[0])}) }
                                    }}/>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                             <label className="text-[11px] font-bold text-[#5D4037] uppercase tracking-widest flex items-center gap-2">
                               <LinkIcon className="w-3 h-3"/> Or Image URL
                            </label>
                            <div className="relative">
                               <input type="text" placeholder="https://..." 
                                 className="w-full pl-3 pr-3 py-2.5 rounded-lg border border-[#D7CCC8] bg-white text-xs focus:ring-2 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] outline-none transition-all placeholder:text-gray-400" 
                                 value={!selectedFile ? editingProduct.image || '' : ''} 
                                 onChange={e => {setSelectedFile(null); setEditingProduct({...editingProduct, image: e.target.value})}} 
                               />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#D7CCC8]/50">
                             <button type="button" onClick={handleAutoAnalyze} disabled={isAnalyzing} 
                                className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                 {isAnalyzing ? <Loader className="animate-spin w-4 h-4"/> : <><Sparkles className="w-4 h-4 text-yellow-200"/> AI Auto-Fill Details</>}
                            </button>
                            <p className="text-[10px] text-center text-gray-500 mt-2 leading-relaxed px-2">
                               Automatic generation of Title, Description (EN/IT) & Anime Name based on visual analysis.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Data Fields */}
                <div className="flex-1 overflow-y-auto bg-[#FAFAF9]">
                    <div className="p-6 md:p-8 space-y-8">
                        <section className="space-y-4">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                              <Box className="w-4 h-4"/> Specification
                           </h4>
                           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">SKU</label>
                                    <input type="text" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] outline-none transition-all font-mono text-xs" 
                                      value={editingProduct.sku || ''} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} placeholder="CODE-001" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price</label>
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] outline-none transition-all text-sm font-medium" 
                                      value={editingProduct.price || ''} 
                                      onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} 
                                      onBlur={handlePriceBlur}
                                      placeholder="€0.00" 
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Size</label>
                                    <input type="text" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] outline-none transition-all text-sm" 
                                      value={editingProduct.dimensions || ''} onChange={e => setEditingProduct({...editingProduct, dimensions: e.target.value})} placeholder="W x H" />
                                </div>
                           </div>
                        </section>

                        <div className="w-full h-px bg-[#E7E5E4]"></div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h4 className="text-sm font-bold text-[#3E2723] flex items-center gap-2 mb-2">
                                   <span className="text-lg bg-gray-100 rounded px-1.5">🇬🇧</span> English
                                </h4>
                                <div className="space-y-4 p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-sm">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Product Title</label>
                                        <input type="text" required placeholder="Product Name" 
                                          className="w-full p-2.5 bg-[#FAFAF9] border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8D6E63]/20 outline-none font-bold text-[#3E2723] text-sm" 
                                          value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Anime Series (EN)</label>
                                        <input type="text" placeholder="e.g. One Piece" 
                                          className="w-full p-2.5 bg-[#FAFAF9] border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8D6E63]/20 outline-none text-sm" 
                                          value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Description</label>
                                        <textarea rows={4} placeholder="Description..." 
                                          className="w-full p-2.5 bg-[#FAFAF9] border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8D6E63]/20 outline-none resize-none text-sm leading-relaxed" 
                                          value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-sm font-bold text-green-900 flex items-center gap-2 mb-2">
                                   <span className="text-lg bg-green-50 rounded px-1.5">🇮🇹</span> Italiano
                                </h4>
                                <div className="space-y-4 p-4 bg-[#F0FDF4]/50 rounded-xl border border-green-100 shadow-sm">
                                    <div>
                                        <label className="block text-[10px] font-bold text-green-700/60 uppercase mb-1.5">Titolo Prodotto</label>
                                        <input type="text" placeholder="Nome Prodotto" 
                                          className="w-full p-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-green-900 text-sm" 
                                          value={editingProduct.name_it || ''} onChange={e => setEditingProduct({...editingProduct, name_it: e.target.value})} />
                                    </div>
                                     <div>
                                        <label className="block text-[10px] font-bold text-green-700/60 uppercase mb-1.5">Serie Anime (IT)</label>
                                        <input type="text" placeholder="es. One Piece" 
                                          className="w-full p-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none text-sm text-green-900" 
                                          value={editingProduct.category_it || ''} onChange={e => setEditingProduct({...editingProduct, category_it: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-green-700/60 uppercase mb-1.5">Descrizione</label>
                                        <textarea rows={4} placeholder="Descrizione..." 
                                          className="w-full p-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none resize-none text-sm leading-relaxed text-green-900" 
                                          value={editingProduct.description_it || ''} onChange={e => setEditingProduct({...editingProduct, description_it: e.target.value})} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-12 p-4 md:px-8 md:py-4 bg-white border-t border-[#E7E5E4] flex gap-3 md:justify-end z-20">
                    <button type="button" onClick={() => setEditingProduct(null)} 
                        className="h-11 px-6 rounded-lg font-bold text-[#5D4037] border border-[#D7CCC8] hover:bg-[#EFEBE9] transition-colors text-sm">
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading} 
                        className="h-11 bg-[#3E2723] text-white px-8 rounded-lg font-bold shadow-md hover:bg-[#5D4037] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait text-sm">
                        {isLoading ? <Loader className="animate-spin w-4 h-4"/> : <><Database className="w-4 h-4"/> Save Product</>}
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
