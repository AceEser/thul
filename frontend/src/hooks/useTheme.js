import { useEffect, useState } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("thul-theme", theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}
