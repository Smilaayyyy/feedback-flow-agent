// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ozsmrcujmzyujznpxnuq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96c21yY3VqbXp5dWp6bnB4bnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTA0NTgsImV4cCI6MjA2MTUyNjQ1OH0.f1MvvbZbqtQLjv8OxKA8M_tQ8P8XMrkcGkRL09K7y0s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);