/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zlylumihuubzqfqanodn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseWx1bWlodXVienFmcWFub2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MjM3ODgsImV4cCI6MjEwMTk5OTc4OH0.sHR3nQVuYaNImeUH4SDqptNfnX87qjYu4wYFgZDwAS4';

export const supabase = createClient(supabaseUrl, supabaseKey);
