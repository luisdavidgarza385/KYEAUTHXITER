"use client";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gx-theme");
    const isDark = stored !== "light";
    setDark(isDark);
    if (!isDark) document.documentElement.classList.add("light");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("gx-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/20 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
      aria-label="Toggle theme"
    >
      {dark ? <Moon className="w-4 h-4 text-white/70" /> : <Sun className="w-4 h-4 text-yellow-400" />}
    </button>
  );
}