import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

// Debug: Check if Cloud credentials are loaded
console.log('🔍 Supabase URL:', SUPABASE_URL);
console.log('🔍 Using placeholder?', SUPABASE_URL.includes('your-project'));

if (SUPABASE_URL.includes('your-project')) {
  console.error('❌ LOVABLE CLOUD NOT CONFIGURED! Go to Settings → Cloud and enable it, then refresh this page.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
