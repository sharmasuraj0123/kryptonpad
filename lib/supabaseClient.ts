import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Define environment variable types
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
