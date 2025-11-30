import { createClient } from '@supabase/supabase-js';

// Мы используем ваши ключи напрямую. 
// В идеале, при деплое на Vercel, добавьте их в Environment Variables как VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://htevicbdhjxiqopcxbzs.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZXZpY2JkaGp4aXFvcGN4YnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDYxMjksImV4cCI6MjA4MDAyMjEyOX0.j73gGTF2heWKyamBBUzFaMwJ7lOuF6_dYiN7X2BT6w8';

export const supabase = createClient(supabaseUrl, supabaseKey);