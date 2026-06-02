import { useState, useEffect, useCallback } from "react";

// Persisted state backed by localStorage. `initial` may be a value or a lazy fn.
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch (e) {
      /* ignore corrupt data */
    }
    return typeof initial === "function" ? initial() : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage full / unavailable — fail silently */
    }
  }, [key, value]);

  const reset = useCallback(() => {
    setValue(typeof initial === "function" ? initial() : initial);
  }, [initial]);

  return [value, setValue, reset];
}
