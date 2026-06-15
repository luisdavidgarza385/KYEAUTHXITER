"use client";
import { useState, useEffect } from "react";
import { Palette } from "lucide-react";

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

  useEffect(() => {
    const stored = localStorage.getItem("gx-accent");
    if (stored) {
      const parts = stored.split(",");
      setH(Number(parts[0]));
      setIdx(Number(parts[3]) || 0);
      applyRGB(parts[1], parts[2], parts[0]);
    }
  }, []);

  function applyRGB(r: string, hr: string, gr: string, hue?: string) {
    const d = document.documentElement;
    d.style.setProperty("--accent-rgb", r);
    d.style.setProperty("--accent-hover-rgb", hr);
    d.style.setProperty("--accent-glow-rgb", gr);
    if (hue) d.style.setProperty("--accent-h", hue);
  }

  function selectPreset(i: number) {
    const p = PRESETS[i];
    setH(p.h);
    setIdx(i);
    applyRGB(p.r, p.hr, p.gr, String(p.h));
    localStorage.setItem("gx-accent", `${p.h},${p.r},${p.hr},${i}`);
  }

  function reset() {
    selectPreset(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-accent-glow" />
        <span className="font-semibold text-sm">Accent Color</span>
      </div>
      <p className="text-xs text-text-muted">Choose your favorite accent color for the panel.</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => selectPreset(i)}
            className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition cursor-pointer"
            style={{ backgroundColor: `rgb(${p.r})` }}
            title={p.name}
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="360"
          value={h}
          onChange={(e) => {
            const hue = Number(e.target.value);
            setH(hue);
            document.documentElement.style.setProperty("--accent-h", String(hue));
          }}
          className="flex-1 accent-accent-glow"
        />
        <button onClick={reset} className="text-xs text-text-muted hover:text-text underline cursor-pointer">
          Reset
        </button>
      </div>
    </div>
  );
}