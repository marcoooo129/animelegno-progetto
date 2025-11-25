
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
    name: 'Sun God Nika', 
    category: 'One Piece', 
    image: 'https://images.unsplash.com/photo-1612404730960-5c7157472611?q=80&w=1000&auto=format&fit=crop', 
    dimensions: '40cm x 30cm',
    price: '€120.00',
    description: 'Hand-carved solid oak relief capturing the liberation drums.',
    inStock: true
  },
  { 
    id: '2', 
    name: 'The Strongest', 
    category: 'Jujutsu Kaisen', 
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    dimensions: '50cm x 35cm',
    price: '€145.00',
    description: 'A complex multi-layer carving featuring Infinite Void.',
    inStock: true
  }
];

export const ProductService = {
  // Fetch all products (Cloud or Local)
  getAll: async (): Promise<Product[]> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return INITIAL_PRODUCTS;
    }

    // === CLOUD MODE ===
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return INITIAL_PRODUCTS;

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        image: item.image,
        dimensions: item.dimensions,
        price: item.price,
        description: item.description,
        inStock: item.in_stock
      }));

    } catch (err: any) {
      console.error('Supabase fetch error, falling back to local:', err);
      return INITIAL_PRODUCTS;
    }
  },

  // Upload image (Cloud Storage or Base64 for Local)
  uploadImage: async (file: File): Promise<string> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // === CLOUD MODE ===
    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 10);
      const fileName = `${Date.now()}-${sanitizedName}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(`Image Upload Failed: ${error.message || 'Unknown error'}`);
    }
  },

  // Save (Create or Update)
  save: async (product: Product): Promise<Product[]> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      const currentProducts = await ProductService.getAll();
      const index = currentProducts.findIndex(p => p.id === product.id);
      
      let updatedProducts;
      if (index >= 0) {
        updatedProducts = [...currentProducts];
        updatedProducts[index] = product;
      } else {
        updatedProducts = [product, ...currentProducts];
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProducts));
      return updatedProducts;
    }

    // === CLOUD MODE ===
    const dbPayload = {
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      dimensions: product.dimensions,
      price: product.price,
      description: product.description,
      in_stock: product.inStock,
    };

    const { error } = await supabase
      .from('products')
      .upsert(dbPayload)
      .select();

    if (error) {
      throw new Error(`Database Save Failed: ${error.message}`);
    }

    return ProductService.getAll();
  },

  // Delete
  delete: async (id: string): Promise<Product[]> => {
    // === LOCAL MODE ===
    if (!isSupabaseConfigured()) {
      const currentProducts = await ProductService.getAll();
      const updatedProducts = currentProducts.filter(p => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProducts));
      return updatedProducts;
    }

    // === CLOUD MODE ===
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Delete Failed: ${error.message}`);
    }

    return ProductService.getAll();
  }
};
