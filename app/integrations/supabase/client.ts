import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://wqqwrgxehqpqnkkrxvyr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcXdyZ3hlaHFwcW5ra3J4dnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODIzNjksImV4cCI6MjA3NDE1ODM2OX0.dOgGNFwuGuTCMoHu5NZfCuRpE7Xwn3QKORubiN39Wc8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
