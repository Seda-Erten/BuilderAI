import { createClient } from "@supabase/supabase-js"

// Supabase URL ve Anon Key'i .env.local dosyasından almalısın.
// Örneğin: NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
// NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
