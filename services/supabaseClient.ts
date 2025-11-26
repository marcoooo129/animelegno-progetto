
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { createClient } from '@supabase/supabase-js';

// ==================================================================================
// 🚀 SUPABASE CONFIGURATION
// ==================================================================================

// Updated with your new Project ID: jqzfwykjfnqhbfunhnpt
const SUPABASE_URL: string = 'https://jqzfwykjfnqhbfunhnpt.supabase.co';

// ⚠️ IMPORTANT: User provided key.
// If connection fails, please ensure this is the 'anon' public key from Project Settings -> API.
const SUPABASE_ANON_KEY: string = 'sb_publishable_szBV30YAusXPZ0fu8ClfhQ_CoWUc3HN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks if the user has replaced the placeholder credentials.
 */
export const isSupabaseConfigured = (): boolean => {
  const isConfigured = (
    !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') &&
    SUPABASE_ANON_KEY.length > 20
  );
  return isConfigured;
};

/*
  ===================================================================
  🔥 DATABASE REPAIR: SOFT DELETE STRATEGY 🔥
  Run this in Supabase SQL Editor to enable "Soft Delete".
  This allows "deleting" items by hiding them, avoiding permission errors.
  ===================================================================

  ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

  ===================================================================
  FULL SETUP SCRIPT (If starting fresh)
  ===================================================================
  
  -- 1. Create Table
  CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    image TEXT,
    dimensions TEXT,
    price TEXT,
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    sku TEXT,
    name_it TEXT,
    category_it TEXT,
    description_it TEXT,
    is_hidden BOOLEAN DEFAULT false
  );

  -- 2. DISABLE RLS (For simplest admin access)
  ALTER TABLE products DISABLE ROW LEVEL SECURITY;
  
  -- 3. Storage
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;
  
  CREATE POLICY "Allow Storage Access" 
  ON storage.objects FOR ALL 
  USING ( bucket_id = 'product-images' ) 
  WITH CHECK ( bucket_id = 'product-images' );
*/
