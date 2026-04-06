import { createClient } from '@supabase/supabase-js'

// Service role client — server-side only, never expose to browser
// Uses untyped client to avoid Database generic conflicts with supabase-js v2.100+
// Run `supabase gen types` after migrations are applied to get full types.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
