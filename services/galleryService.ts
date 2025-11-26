
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GalleryItem } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ProductService } from './productService'; // Reuse upload logic

const LOCAL_STORAGE_KEY = 'animelegno_gallery';

const INITIAL_GALLERY: GalleryItem[] = [
    { id: '1', image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop' },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1612404730960-5c7157472611?q=80&w=1000&auto=format&fit=crop' },
    { id: '3', image_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000&auto=format&fit=crop' },
    { id: '4', image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop' },
];

export const GalleryService = {
    getAll: async (): Promise<GalleryItem[]> => {
        if (!isSupabaseConfigured()) {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : INITIAL_GALLERY;
        }

        try {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Gallery Fetch Error:', error);
            return [];
        }
    },

    // Updated to accept File OR String (URL)
    save: async (input: File | string): Promise<GalleryItem[]> => {
        let url: string;

        // 1. Get URL (either use provided string or upload file)
        if (typeof input === 'string') {
            url = input;
        } else {
            url = await ProductService.uploadImage(input);
        }
        
        // 2. Local Mode Save
        if (!isSupabaseConfigured()) {
            const current = await GalleryService.getAll();
            const newItem = { id: Date.now().toString(), image_url: url };
            const updated = [newItem, ...current];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        }

        // 3. Cloud Mode Save
        const { error } = await supabase.from('gallery').insert({ image_url: url });
        if (error) throw error;
        
        return GalleryService.getAll();
    },

    delete: async (id: string): Promise<GalleryItem[]> => {
        if (!isSupabaseConfigured()) {
            const current = await GalleryService.getAll();
            const updated = current.filter(item => item.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        }

        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) throw error;

        return GalleryService.getAll();
    }
};
