"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, AppWindow, Key, Users, UserCheck, Coins, MessageSquare, Shield, Code, Settings, LayoutDashboard, ArrowRight, Loader2 } from "lucide-react";

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  url: string;
  category: string;
  icon?: string;
}

export function GlobalCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for Ctrl+K, Cmd+K, or custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("spectral-open-search", handleOpenEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("spectral-open-search", handleOpenEvent);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Perform search on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setResults(json.results || []);
            setSelectedIndex(0);
          }
        }
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Keyboard Navigation (Up/Down/Enter)
  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex].url);
    }
  };

  const navigateTo = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const getCategoryIcon = (category: string, type: string) => {
    switch (category) {
      case "Navegación":
        switch (type) {
          case "page":
            return <LayoutDashboard className="w-4 h-4 text-sky-400" />;
          default:
            return <ArrowRight className="w-4 h-4 text-sky-400" />;
        }
      case "Aplicaciones":
        return <AppWindow className="w-4 h-4 text-emerald-400" />;
      case "Licencias":
        return <Key className="w-4 h-4 text-purple-400" />;
      case "Usuarios":
        return <Users className="w-4 h-4 text-blue-400" />;
      case "Sub-resellers":
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Search className="w-4 h-4 text-sky-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in font-sans">
      <div
        className="w-full max-w-2xl bg-[#030914] border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-sky-500/20 bg-[#050e20]">
          <Search className="w-5 h-5 text-sky-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none font-medium"
            placeholder="Buscar páginas, aplicaciones, licencias, usuarios, API keys..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNavigation}
          />
          {loading && <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0 mr-2" />}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-sky-500/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-sky-500/10">
          {!query.trim() && (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-sky-500/40 mx-auto" />
              <p className="text-xs text-zinc-400">Escribe para buscar aplicaciones, usuarios, licencias o páginas.</p>
              <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-zinc-500 font-mono">
                <span className="bg-sky-950/40 border border-sky-500/20 px-2 py-0.5 rounded text-sky-400">Ctrl + K</span> abrir
                <span className="bg-sky-950/40 border border-sky-500/20 px-2 py-0.5 rounded text-sky-400">↑ ↓</span> navegar
                <span className="bg-sky-950/40 border border-sky-500/20 px-2 py-0.5 rounded text-sky-400">Enter</span> abrir
              </div>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-400">
              No se encontraron resultados para &quot;<span className="text-sky-400">{query}</span>&quot;
            </div>
          )}

          {results.map((res, idx) => (
            <div
              key={res.title + idx}
              onClick={() => navigateTo(res.url)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                selectedIndex === idx
                  ? "bg-sky-500/20 border border-sky-500/40 text-white shadow-md shadow-sky-500/10"
                  : "hover:bg-sky-500/10 text-zinc-300 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/20 shrink-0">
                  {getCategoryIcon(res.category, res.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs truncate tracking-wide">{res.title}</span>
                    <span className="text-[9px] font-mono uppercase bg-sky-950/60 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded shrink-0">
                      {res.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{res.subtitle}</p>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${selectedIndex === idx ? "translate-x-1 text-sky-400" : "text-zinc-600"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
