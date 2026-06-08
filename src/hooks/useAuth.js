import { useState, useEffect, useCallback } from "react";
import { supabase, isCloudEnabled } from "../lib/supabase.js";

// Auth state for the email/password flow. When cloud is disabled, this
// reports "ready with no user" so the app runs local-only.
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isCloudEnabled);

  useEffect(() => {
    if (!isCloudEnabled) { setLoading(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    if (isCloudEnabled) await supabase.auth.signOut();
    // Clear the local cache so the next person on this device starts clean.
    try { localStorage.removeItem("habitflow_data"); } catch (e) {}
    window.location.reload();
  }, []);

  return { session, user: session?.user || null, loading, signUp, signIn, signOut, cloud: isCloudEnabled };
}
