import { useState, useEffect, useCallback } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch (e) {}
    return typeof initial === "function" ? initial() : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }, [key, value]);

  const reset = useCallback(() => {
    setValue(typeof initial === "function" ? initial() : initial);
  }, [initial]);

  return [value, setValue, reset];
}
