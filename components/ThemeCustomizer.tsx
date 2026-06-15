"use client";
import { useState, useEffect } from "react";
import { Palette, Sparkles } from "lucide-react";

const PRESETS = [
  { name: "Indigo", h: 239, r: "99 102 241", hr: "79 70 229", gr: "129 140 248" },
  { name: "Purple", h: 270, r: "139 92 246", hr: "124 58 237", gr: "167 139 250" },
  { name: "Pink", h: 330, r: "236 72 153", hr: "219 39 119", gr: "244 114 182" },
  { name: "Red", h: 0, r: "239 68 68", hr: "220 38 38", gr: "248 113 113" },
  { name: "Orange", h: 25, r: "249 115 22", hr: "234 88 12", gr: "251 146 60" },
  { name: "Yellow", h: 45, r: "234 179 8", hr: "202 138 4", gr: "250 204 21" },
  { name: "Green", h: 142, r: "34 197 94", hr: "22 163 74", gr: "74 222 128" },
  { name: "Teal", h: 175, r: "20 184 166", hr: "13 148 136", gr: "45 212 191" },
  { name: "Cyan", h: 195, r: "6 182 212", hr: "8 145 178", gr: "34 211 238" },
  { name: "Blue", h: 220, r: "59 130 246", hr: "37 99 235", gr: "96 165 250" },
];

export function ThemeCustomizer() {
  const [h, setH] = useState(239);
  const [idx, setIdx] = useState(0);
  const [rgbMode, setRgbMode] = useState(false);

  useEffect(() => {
    const isRgb = localStorage.getItem("gx-accent-rgb") === "true";
    setRgbMode(isRgb);

    const stored = localStorage.getItem("gx-accent");
    if (stored) {
      const parts = stored.split(",");
      setH(Number(parts[0]));
      setIdx(Number(parts[3]) || 0);
    }

    function onSync() {
      setRgbMode(localStorage.getItem("gx-accent-rgb") === "true");
      const storedAccent = localStorage.getItem("gx-accent");
      if (storedAccent) {
        const parts = storedAccent.split(",");
        setH(Number(parts[0]));
        setIdx(Number(parts[3]) || 0);
      }
    }
    window.addEventListener("gx-accent-change", onSync);
    return () => window.removeEventListener("gx-accent-change", onSync);
  }, []);

  function applyRGB(r: string, hr: string, gr: string, hue?: string) {
    const d = document.documentElement;
    d.style.setProperty("--accent-rgb", r);
    d.style.setProperty("--accent-hover-rgb", hr);
    d.style.setProperty("--accent-glow-rgb", gr);
    if (hue) d.style.setProperty("--accent-h", hue);
  }

  function hslToRgb(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const y = Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
      return Math.round(255 * (l - a * y));
    };
    return `${f(0)} ${f(8)} ${f(4)}`;
  }

  function selectPreset(i: number) {
    const p = PRESETS[i];
    setH(p.h);
    setIdx(i);
    setRgbMode(false);
    localStorage.setItem("gx-accent-rgb", "false");
    applyRGB(p.r, p.hr, p.gr, String(p.h));
    localStorage.setItem("gx-accent", `${p.h},${p.r},${p.hr},${i}`);
    window.dispatchEvent(new Event("gx-accent-change"));
  }

  function toggleRgbMode() {
    const next = !rgbMode;
    setRgbMode(next);
    localStorage.setItem("gx-accent-rgb", String(next));
    window.dispatchEvent(new Event("gx-accent-change"));
  }

  function handleHueChange(hue: number) {
    setH(hue);
    setRgbMode(false);
    localStorage.setItem("gx-accent-rgb", "false");
    const r = hslToRgb(hue, 84, 60);
    const hr = hslToRgb(hue, 84, 50);
    const gr = hslToRgb(hue, 84, 70);
    applyRGB(r, hr, gr, String(hue));
    localStorage.setItem("gx-accent", `${hue},${r},${hr},999`);
    window.dispatchEvent(new Event("gx-accent-change"));
  }

  function reset() {
    selectPreset(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4.5 h-4.5 text-accent-glow" />
          <span className="font-semibold text-sm">Accent Color</span>
        </div>
        
        {/* Glowing RGB Toggle Button */}
        <button
          onClick={toggleRgbMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 cursor-pointer ${
            rgbMode
              ? "text-white border-transparent shadow-lg shadow-purple-500/30 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500 bg-[length:400%_400%] animate-[bgPan_6s_linear_infinite]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {rgbMode ? "Modo RGB Activado" : "Activar Modo RGB"}
        </button>
      </div>
      
      <p className="text-xs text-text-muted">
        Choose your favorite accent color for the panel, or activate gamer RGB cycling mode.
      </p>

      {/* Preset color bubbles */}
      <div className={`flex flex-wrap gap-2 transition-opacity duration-300 ${rgbMode ? "opacity-40" : "opacity-100"}`}>
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => selectPreset(i)}
            className={`w-8 h-8 rounded-full border-2 transition cursor-pointer hover:scale-115 ${
              !rgbMode && idx === i ? "border-white scale-105 shadow-md shadow-accent/40" : "border-border"
            }`}
            style={{ backgroundColor: `rgb(${p.r})` }}
            title={p.name}
          />
        ))}
      </div>

      {/* Hue range slider */}
      <div className={`flex items-center gap-3 transition-opacity duration-300 ${rgbMode ? "opacity-35" : "opacity-100"}`}>
        <input
          type="range"
          min="0"
          max="360"
          value={h}
          disabled={rgbMode}
          onChange={(e) => handleHueChange(Number(e.target.value))}
          className="flex-1 accent-accent-glow cursor-pointer disabled:cursor-not-allowed"
        />
        <button
          onClick={reset}
          disabled={rgbMode}
          className="text-xs text-text-muted hover:text-text underline cursor-pointer disabled:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
}