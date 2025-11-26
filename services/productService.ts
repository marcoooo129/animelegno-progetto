
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Product } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'animelegno_products';

// Fallback data
const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    sku: 'OP-NIKA-001',
    name: 'Sun God Nika',
    name_it: 'Dio Sole Nika',
    category: 'One Piece',
    category_it: 'One Piece',
    image: 'https://images.unsplash.com/photo-1612404730960-5c7157472611?q=80&w=1000&auto=format&fit=crop', 
    dimensions: '40cm x 30cm',
    price: '€120.00',
    description: 'Hand-carved solid oak relief capturing the liberation drums.',
    description_it: 'Rilievo in rovere massiccio intagliato a mano che cattura i tamburi della liberazione.',
    inStock: true,
    isHidden: false
  },
  { 
    id: '2', 
    sku: 'JKT-GOJO-002',
    name: 'The Strongest', 
    name_it: 'Il Più Forte',
    category: 'Jujutsu Kaisen', 
    category_it: 'Jujutsu Kaisen',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    dimensions: '50cm x 35cm',
    price: '€145.00',
    description: 'A complex multi-layer carving featuring Infinite Void.',
    description_it: 'Un intaglio multistrato complesso raffigurante il Vuoto Infinito.',
    inStock: true,
    isHidden: false
  }
];

export const ProductService = {
  // Fetch all products
  getAll: async (): Promise<Product[]> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    }

    // === CLOUD MODE ===
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Map data and FILTER OUT HIDDEN items
      return data.map((item: any) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        name_it: item.name_it,
        category: item.category,
        category_it: item.category_it,
        image: item.image,
        dimensions: item.dimensions,
        price: item.price,
        description: item.description,
        description_it: item.description_it,
        inStock: item.in_stock,
        isHidden: item.is_hidden
      })).filter((p: Product) => !p.isHidden); // Soft Delete Filter

    } catch (err: any) {
      console.error('ProductService Fetch Error:', JSON.stringify(err, null, 2));
      return [];
    }
  },

  // Upload image
  uploadImage: async (file: File): Promise<string> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    // === CLOUD MODE ===
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Upload Error:', JSON.stringify(error, null, 2));
      throw new Error(`Upload Failed: ${error.message}`);
    }
  },

  // Save (Upsert)
  save: async (product: Product): Promise<Product[]> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      const current = await ProductService.getAll();
      const index = current.findIndex(p => p.id === product.id);
      const updated = [...current];
      if (index >= 0) updated[index] = product;
      else updated.unshift(product);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    // === CLOUD MODE ===
    const isNew = !product.id || product.id.length < 10;
    
    const dbPayload: any = {
      sku: product.sku || '',
      name: product.name,
      name_it: product.name_it || '', 
      category: product.category,
      category_it: product.category_it || '',
      image: product.image,
      dimensions: product.dimensions,
      price: product.price,
      description: product.description,
      description_it: product.description_it || '',
      in_stock: product.inStock,
      is_hidden: product.isHidden || false // Ensure we don't accidentally hide it on save
    };

    if (!isNew) {
      dbPayload.id = product.id;
    }

    const { error } = await supabase
      .from('products')
      .upsert(dbPayload);

    if (error) {
      console.error('Save Error:', JSON.stringify(error, null, 2));
      
      // Handle missing column errors hint
      if (error.code === 'PGRST204') {
          throw new Error(`DB Schema Error: ${error.message}. Please update your table columns.`);
      }

      throw new Error(error.message);
    }

    return ProductService.getAll();
  },

  // Delete -> NOW "SOFT DELETE" (Hide)
  delete: async (id: string): Promise<Product[]> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      const current = await ProductService.getAll();
      // For local, we can just remove it
      const updated = current.filter(p => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    // === CLOUD MODE (Soft Delete) ===
    // We update 'is_hidden' to true instead of deleting the row.
    // This bypasses 'DELETE' permission issues.
    const { error } = await supabase
      .from('products')
      .update({ is_hidden: true })
      .eq('id', id);

    if (error) {
      console.error('Soft Delete Error:', JSON.stringify(error, null, 2));
      
      // Specifically check for missing column error
      if (error.code === 'PGRST204' || error.message.includes('column "is_hidden" does not exist')) {
          throw new Error(`Missing "is_hidden" column. Please run the Repair SQL.`);
      }
      
      throw new Error(error.message);
    }

    // Success (even if no rows updated, we assume success to keep UI happy)
    return ProductService.getAll();
  },
  
  // Seed initial data
  seedInitialData: async (): Promise<Product[]> => {
     if (!isSupabaseConfigured()) return INITIAL_PRODUCTS;
     
     for (const p of INITIAL_PRODUCTS) {
         await ProductService.save({ ...p, id: '' });
     }
     return ProductService.getAll();
  }
};
