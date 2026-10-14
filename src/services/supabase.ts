import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://oqrhrwlrvvvzkeontgpj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcmhyd2xydnZ2emtlb250Z3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzU3MzYsImV4cCI6MjEwNTcxMTczNn0.QBe_D2zFKWe2sv5SGTlIp6WdC-2tH3HXxbxLzwnLZ5E';

export const supabase = createClient(supabaseUrl, supabaseKey);
