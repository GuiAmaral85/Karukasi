import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using service role key (bypasses RLS)
// Only use in API routes and server components — never expose to browser
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
