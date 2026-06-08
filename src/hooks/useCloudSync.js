import { useEffect, useRef, useState } from "react";
import { supabase, isCloudEnabled } from "../lib/supabase.js";
import { useStore } from "../store/habitStore.jsx";

const TABLE = "user_data";

// Syncs the store's state with a single per-user row in Supabase.
// - On login: pull the row. If none exists, push current local data (migration).
// - After the initial pull: debounced push on every state change.
export function useCloudSync(user) {
  const { state, dispatch } = useStore();
  const [status, setStatus] = useState("idle"); // idle | syncing | synced | error
  const pulledForRef = useRef(null);
  const pushTimer = useRef(null);

  // Initial pull when a user logs in.
  useEffect(() => {
    if (!isCloudEnabled || !user) { pulledForRef.current = null; return; }
    if (pulledForRef.current === user.id) return;

    let cancelled = false;
    (async () => {
      setStatus("syncing");
      const { data, error } = await supabase
        .from(TABLE).select("data").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      if (error) { setStatus("error"); return; }

      if (data && data.data && Array.isArray(data.data.habits)) {
        // Cloud has data -> it's authoritative for this account.
        dispatch({ type: "IMPORT", data: data.data });
      } else {
        // First time for this account -> migrate current local data up.
        await supabase.from(TABLE).upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() });
      }
      pulledForRef.current = user.id;
      setStatus("synced");
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Debounced push on state change (only after the initial pull completed).
  useEffect(() => {
    if (!isCloudEnabled || !user) return;
    if (pulledForRef.current !== user.id) return;

    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      setStatus("syncing");
      const { error } = await supabase
        .from(TABLE)
        .upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() });
      setStatus(error ? "error" : "synced");
    }, 800);

    return () => { if (pushTimer.current) clearTimeout(pushTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, user]);

  return status;
}
