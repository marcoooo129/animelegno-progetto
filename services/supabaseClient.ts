
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { createClient } from '@supabase/supabase-js';

// ==================================================================================
// 🚀 SUPABASE CONFIGURATION
// ==================================================================================

const SUPABASE_URL: string = 'https://ksugfejbhxbwbsdxdabd.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdWdmZWpiaHhid2JzZHhkYWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDkyODcsImV4cCI6MjA3OTU4NTI4N30.Mca7HSkouJnoQ0q6-Z5O8hqQSJp9VZUesXQva4inCjs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks if the user has replaced the placeholder credentials.
 * 如果用户填写了真实的 Key，此函数返回 true
 */
export const isSupabaseConfigured = (): boolean => {
  const isConfigured = (
    !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') &&
    SUPABASE_ANON_KEY.length > 20
  );
  return isConfigured;
};
