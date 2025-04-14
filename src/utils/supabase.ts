import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export async function getAllCDOs() {
  try {
    console.log('Making API call to fetch CDOs...');
    const { data, error } = await supabase
      .from('Campaign')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} CDOs`);
    return data || [];
  } catch (error) {
    console.error('Error in getAllCDOs:', error);
    throw error;
  }
} 