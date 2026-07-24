"use client";

import React, { useState, useEffect } from "react";
import { 
  Code, Copy, Check, Trash2, ArrowRightLeft, Sparkles, 
  FileCode, Layers, Info, CheckCircle2, Sliders, Cpu, Binary, RefreshCw, Zap
} from "lucide-react";

type FormatMode = "c-style" | "c-array" | "ida" | "ce-mask" | "csharp" | "python" | "rust" | "escaped";

export default function HexConverterPage() {
  const [inputHex, setInputHex] = useState<string>("FF FF 00 00 ?? ?? ?? ??");
  const [outputMode, setOutputMode] = useState<FormatMode>("c-style");
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [outputResult, setOutputResult] = useState<string>("");
  const [byteCount, setByteCount] = useState<number>(0);
  const [fixedByteCount, setFixedByteCount] = useState<number>(0);
  const [wildcardCount, setWildcardCount] = useState<number>(0);
  const [extraMask, setExtraMask] = useState<string>("");
  const [isReverse, setIsReverse] = useState<boolean>(false);

  useEffect(() => {
    convertHex();
  }, [inputHex, outputMode, uppercase, isReverse]);

  function convertHex() {
    const raw = inputHex.trim();
    if (!raw) {
      setOutputResult("");
      setByteCount(0);
      setFixedByteCount(0);
      setWildcardCount(0);
      setExtraMask("");
      return;
    }

    if (isReverse) {
      // Reverse mode: convert C-style or array input back to clean IDA / Raw Hex
      // Extract hex numbers like 0xFF, 0xff, \xff, or '?'
      const tokens = raw.match(/0x[0-9A-Fa-f]{2}|\\x[0-9A-Fa-f]{2}|[0-9A-Fa-f]{2}|'\?'|\?/g);
      if (!tokens) {
        setOutputResult("");
        setByteCount(0);
        setFixedByteCount(0);
        setWildcardCount(0);
        setExtraMask("");
        return;
      }

      const cleanTokens: string[] = [];
      let wCount = 0;
      let fCount = 0;

      for (let t of tokens) {
        t = t.replace(/0x|\\x|'/g, "");
        if (t === "?" || t === "??") {
          cleanTokens.push("??");
          wCount++;
        } else {
          cleanTokens.push(uppercase ? t.toUpperCase() : t.toLowerCase());
          fCount++;
        }
      }

      setByteCount(cleanTokens.length);
      setFixedByteCount(fCount);
      setWildcardCount(wCount);
      setOutputResult(cleanTokens.join(" "));
      return;
    }

    // Normal mode: Raw Hex / IDA pattern to C-Style / Arrays
    const tokens = raw.match(/[0-9A-Fa-f]{2}|\?{2}|\?/g);
    if (!tokens) {
      setOutputResult("");
      setByteCount(0);
      setFixedByteCount(0);
      setWildcardCount(0);
      setExtraMask("");
      return;
    }

    const formatted: string[] = [];
    const maskChars: string[] = [];
    let wCount = 0;
    let fCount = 0;
    let totalBytes = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === "??" || token === "?") {
        const count = token === "??" ? 2 : 1;
        wCount += count;
        totalBytes += count;

        for (let c = 0; c < count; c++) {
          maskChars.push("?");
          if (outputMode === "c-style" || outputMode === "c-array") {
            formatted.push("'?'");
          } else if (outputMode === "ida") {
            formatted.push("?");
          } else if (outputMode === "ce-mask" || outputMode === "csharp" || outputMode === "rust") {
            formatted.push(uppercase ? "0x00" : "0x00");
          } else if (outputMode === "python") {
            formatted.push("\\x00");
          } else if (outputMode === "escaped") {
            formatted.push("\\x00");
          }
        }
      } else {
        totalBytes += 1;
        fCount += 1;
        maskChars.push("x");
        const hexVal = uppercase ? token.toUpperCase() : token.toLowerCase();

        if (outputMode === "c-style" || outputMode === "c-array" || outputMode === "csharp" || outputMode === "rust") {
          formatted.push(`0x${hexVal}`);
        } else if (outputMode === "ida") {
          formatted.push(hexVal);
        } else if (outputMode === "ce-mask") {
          formatted.push(`0x${hexVal}`);
        } else if (outputMode === "python" || outputMode === "escaped") {
          formatted.push(`\\x${hexVal}`);
        }
      }
    }

    setByteCount(totalBytes);
    setFixedByteCount(fCount);
    setWildcardCount(wCount);
    setExtraMask(maskChars.join(""));

    let finalStr = "";
    if (outputMode === "c-style") {
      finalStr = formatted.join(", ");
    } else if (outputMode === "c-array") {
      finalStr = `const unsigned char pattern[${totalBytes}] = {\n  ${formatted.join(", ")}\n};`;
    } else if (outputMode === "ida") {
      finalStr = formatted.join(" ");
    } else if (outputMode === "ce-mask") {
      finalStr = `// Bytes Hex:\n${formatted.join(", ")}\n\n// Máscara (Mask):\n"${maskChars.join("")}"`;
    } else if (outputMode === "csharp") {
      finalStr = `byte[] pattern = new byte[${totalBytes}] {\n  ${formatted.join(", ")}\n};`;
    } else if (outputMode === "python") {
      finalStr = `pattern = b"${formatted.join("")}"`;
    } else if (outputMode === "rust") {
      finalStr = `pub static PATTERN: &[u8; ${totalBytes}] = &[\n  ${formatted.join(", ")}\n];`;
    } else if (outputMode === "escaped") {
      finalStr = `"${formatted.join("")}"`;
    }

    setOutputResult(finalStr);
  }

  function handleCopy() {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleClear() {
    setInputHex("");
    setOutputResult("");
    setByteCount(0);
    setFixedByteCount(0);
    setWildcardCount(0);
    setExtraMask("");
  }

  function loadPreset(presetHex: string) {
    setIsReverse(false);
    setInputHex(presetHex);
  }

  const specPercentage = byteCount > 0 ? Math.round((fixedByteCount / byteCount) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1300px] mx-auto space-y-6 text-zinc-300 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
              Herramienta de Desarrollo & RE
            </span>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-zinc-100 mt-1">
            <Binary className="w-6 h-6 text-emerald-400" />
            Convertidor de Códigos & Hexadecimal
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium max-w-2xl">
            Herramienta avanzada para convertir firmas Hex, patrones de Cheat Engine, IDA Pro y escaneos de memoria en arreglos listos para C/C++, C#, Python y Rust.
          </p>
        </div>

        {/* Action Toggle / Mode switch */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsReverse(!isReverse)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-bold transition shadow-md ${
              isReverse
                ? "bg-purple-950/50 border-purple-500/40 text-purple-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
            {isReverse ? "Modo Inverso (C → Hex)" : "Modo Normal (Hex → C)"}
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-emerald-400" /> Presets rápidos:
        </span>
        {[
          { label: "Hook Prologue x64", hex: "48 89 5C 24 ?? 48 89 74 24 ?? 57 48 83 EC 20" },
          { label: "KeyAuth Sig Scan", hex: "FF FF 00 00 ?? ?? ?? ?? 48 8B 05" },
          { label: "Anti-Cheat Bypass", hex: "48 8D 0D ?? ?? ?? ?? E8 ?? ?? ?? ?? 85 C0" },
          { label: "VTable Swap", hex: "48 8B 01 FF 90 ?? ?? 00 00" },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => loadPreset(p.hex)}
            className="px-3 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-emerald-300 text-[11px] font-medium transition shrink-0"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Input & Options */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-zinc-950/70 border border-zinc-850 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                {isReverse ? "Pega tu código C / C# / Bytes:" : "Pega tu código Hexadecimal:"}
              </label>

              {/* Stats badges */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold">
                  {byteCount} {byteCount === 1 ? "byte" : "bytes"}
                </span>
                {wildcardCount > 0 && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-500/20 font-bold">
                    {wildcardCount} wildcards (?)
                  </span>
                )}
              </div>
            </div>

            <textarea
              value={inputHex}
              onChange={(e) => setInputHex(e.target.value)}
              placeholder={isReverse ? "0xFF, 0xFF, 0x00, 0x00, '?', '?' ..." : "FF FF 00 00 ?? ?? ?? ?? ..."}
              rows={9}
              className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 p-3.5 rounded-lg font-mono text-xs leading-relaxed outline-none focus:border-emerald-500/50 transition resize-y shadow-inner"
            />

            {/* Formatting Toggles */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 select-none">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Mayúsculas (<code className="text-emerald-400">0xFF</code>)</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar
              </button>
            </div>
          </div>

          {/* Stats Analysis Card */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" /> Análisis del Patrón
              </span>
              <span className="font-mono text-emerald-400 font-bold">{specPercentage}% especificidad</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${specPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 font-mono">
              <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
                <div className="text-zinc-500 text-[10px] uppercase font-sans font-bold">Total Bytes</div>
                <div className="text-zinc-200 font-bold text-sm mt-0.5">{byteCount}</div>
              </div>
              <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
                <div className="text-zinc-500 text-[10px] uppercase font-sans font-bold">Bytes Fijos</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{fixedByteCount}</div>
              </div>
              <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
                <div className="text-zinc-500 text-[10px] uppercase font-sans font-bold">Comodines</div>
                <div className="text-amber-400 font-bold text-sm mt-0.5">{wildcardCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Output & Selector */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-zinc-950/70 border border-zinc-850 rounded-xl p-5 shadow-xl space-y-4">
            {/* Format Selection Tabs */}
            {!isReverse && (
              <div>
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Formato de Lenguaje / Salida
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "c-style", label: "C Inline ('?')" },
                    { id: "c-array", label: "C/C++ Array" },
                    { id: "ida", label: "IDA Pattern" },
                    { id: "ce-mask", label: "Cheat Engine" },
                    { id: "csharp", label: "C# byte[]" },
                    { id: "python", label: "Python b\"...\"" },
                    { id: "rust", label: "Rust [u8]" },
                    { id: "escaped", label: "Escaped String" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setOutputMode(mode.id as FormatMode)}
                      className={`px-2 py-2 rounded-lg border text-[11.5px] font-bold transition text-center truncate ${
                        outputMode === mode.id
                          ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Output Display Header */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-400" /> {isReverse ? "Resultado (Hex IDA Clean)" : "Resultado Convertido"}
              </label>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!outputResult}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition shadow-md ${
                  copied
                    ? "bg-emerald-500 text-zinc-950 font-bold"
                    : "bg-emerald-650 hover:bg-emerald-550 text-white shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar Código
                  </>
                )}
              </button>
            </div>

            {/* Output Box */}
            <div className="relative">
              <pre className="w-full min-h-[220px] max-h-[360px] bg-zinc-900/90 border border-zinc-800 text-emerald-300 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap word-break-all shadow-inner">
                {outputResult || <span className="text-zinc-650 italic">El resultado formateado aparecerá aquí...</span>}
              </pre>
            </div>

            {/* Extra Mask Indicator */}
            {extraMask && outputMode !== "ce-mask" && !isReverse && (
              <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-xs space-y-1">
                <div className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider">Máscara de Escaneo (Scan Mask)</div>
                <div className="font-mono text-emerald-400 text-xs break-all">{extraMask}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
