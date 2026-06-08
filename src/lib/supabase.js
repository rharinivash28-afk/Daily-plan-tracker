import { createClient } from "@supabase/supabase-js";

// Reads Vite env vars set at build time. If they're absent, supabase stays
// null and the whole app runs in local-only mode (no login, no sync).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isCloudEnabled = Boolean(url && anonKey);

export const supabase = isCloudEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
