import { useEffect, useCallback } from "react";
import { useStore } from "../store/habitStore.jsx";

// Reads darkMode from the store, applies `dark` class to <html>, persists via store.
export function useTheme() {
  const { state, dispatch } = useStore();
  const isDark = state.user.darkMode;

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  const toggle = useCallback(() => {
    dispatch({ type: "SET_USER", patch: { darkMode: !isDark } });
  }, [dispatch, isDark]);

  const setDark = useCallback(
    (val) => dispatch({ type: "SET_USER", patch: { darkMode: !!val } }),
    [dispatch]
  );

  return { isDark, toggle, setDark };
}
