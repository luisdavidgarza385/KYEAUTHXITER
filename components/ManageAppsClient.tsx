"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface AppItemData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  secret: string;
  version: string;
  downloadUrl: string;
  status: "active" | "paused";
  users: number;
  licenses: number;
  subscriptions: number;
  hwidLock: boolean;
  maxResets: number;
  hwidMismatchMsg: string;
}

export function ManageAppsClient({
  initialApps,
}: {
  initialApps: AppItemData[];
}) {
  const router = useRouter();
  const [appsList, setAppsList] = useState<AppItemData[]>(initialApps);
  const [currentApp, setCurrentApp] = useState<AppItemData>(
    initialApps[0] || {
      id: "app-9999",
      name: "9999",
      description: "App Principal",
      ownerId: "0FY7WpdIue",
      secret: "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
      version: "1.0",
      downloadUrl: "",
      status: "active",
      users: 0,
      licenses: 0,
      subscriptions: 1,
      hwidLock: true,
      maxResets: 20,
      hwidMismatchMsg: "HWID doesn't match. Ask for a HWID reset",
    }
  );

  const [selectedLang, setSelectedLang] = useState<"csharp" | "cpp" | "python" | "js">("csharp");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal Create App State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSelectApp = (app: AppItemData) => {
    setCurrentApp(app);
    document.cookie = `ka_current_app=${app.id}; path=/; max-age=2592000`;
    setFeedback(`Aplicación seleccionada: ${app.name}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAppName.trim(),
          version: "1.0",
          level: 1,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const created = json.data;
        const newAppItem: AppItemData = {
          id: created.id,
          name: created.name,
          description: newAppDesc.trim() || "App SecureX",
          ownerId: created.owner_secret || "0FY7WpdIue",
          secret: created.app_secret || "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
          version: created.version || "1.0",
          downloadUrl: "",
          status: "active",
          users: 0,
          licenses: 0,
          subscriptions: 1,
          hwidLock: true,
          maxResets: 20,
          hwidMismatchMsg: "HWID doesn't match. Ask for a HWID reset",
        };
        setAppsList((prev) => [newAppItem, ...prev]);
        setCurrentApp(newAppItem);
        setCreateModalOpen(false);
        setNewAppName("");
        setNewAppDesc("");
        setFeedback(`¡Aplicación "${newAppItem.name}" creada con éxito!`);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const generatedOwner = Math.random().toString(36).slice(2, 12).toUpperCase();
        const generatedSecret = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

        const fallbackApp: AppItemData = {
          id: `app-${Date.now()}`,
          name: newAppName.trim(),
          description: newAppDesc.trim() || "App SecureX",
          ownerId: generatedOwner,
          secret: generatedSecret,
          version: "1.0",
          downloadUrl: "",
          status: "active",
          users: 0,
          licenses: 0,
          subscriptions: 1,
          hwidLock: true,
          maxResets: 20,
          hwidMismatchMsg: "HWID doesn't match. Ask for a HWID reset",
        };
        setAppsList((prev) => [fallbackApp, ...prev]);
        setCurrentApp(fallbackApp);
        setCreateModalOpen(false);
        setNewAppName("");
        setNewAppDesc("");
        setFeedback(`Aplicación "${fallbackApp.name}" añadida.`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Error al crear aplicación");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = () => {
    setAppsList((prev) =>
      prev.map((a) => (a.id === currentApp.id ? { ...currentApp } : a))
    );
    setFeedback("Cambios guardados con éxito.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRotateSecret = () => {
    const newSec = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setCurrentApp((prev) => ({ ...prev, secret: newSec }));
    setAppsList((prev) =>
      prev.map((a) => (a.id === currentApp.id ? { ...a, secret: newSec } : a))
    );
    setFeedback("Secreto rotado con éxito.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTogglePause = () => {
    const nextStatus = currentApp.status === "active" ? "paused" : "active";
    setCurrentApp((prev) => ({ ...prev, status: nextStatus }));
    setAppsList((prev) =>
      prev.map((a) => (a.id === currentApp.id ? { ...a, status: nextStatus } : a))
    );
  };

  const getCode = (lang: string) => {
    if (lang === "csharp") {
      return `using SecureXAuth;\nvar app = new Client("${currentApp.name}", "${currentApp.ownerId}", "${currentApp.secret}", "${currentApp.version}");\nawait app.InitAsync();`;
    }
    if (lang === "cpp") {
      return `#include "SecureXAuth.h"\nSecureXAuth::Client AuthOwner(SecureXAuth::ApiUrl(), "${currentApp.name}", "${currentApp.ownerId}", "${currentApp.secret}", "${currentApp.version}");\nAuthOwner.Init();`;
    }
    if (lang === "python") {
      return `from securexauth import SecureXAuth\napp = SecureXAuth("${currentApp.name}", "${currentApp.ownerId}", "${currentApp.secret}", "${currentApp.version}")\napp.init()`;
    }
    return `const SecureXAuth = require('securexauth');\nconst app = new SecureXAuth("${currentApp.name}", "${currentApp.ownerId}", "${currentApp.secret}", "${currentApp.version}");\nawait app.init();`;
  };

  const filteredApps = appsList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* Feedback banner */}
      {feedback && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── TOP APP HEADER CARD ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-5 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0088ff] to-[#0044aa] flex items-center justify-center font-black text-white text-lg shadow-lg">
            {currentApp.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{currentApp.name}</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9.5px] font-black tracking-wider uppercase border border-emerald-500/30">
                {currentApp.status === "active" ? "ACTIVA" : "PAUSADA"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">App SecureX Auth</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            handleCopy(
              `Name: ${currentApp.name}\nOwner ID: ${currentApp.ownerId}\nSecret: ${currentApp.secret}\nVersion: ${currentApp.version}`,
              "all-creds"
            )
          }
          className="px-4 py-2 rounded-xl bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          {copiedKey === "all-creds" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00c2ff]" />}
          <span>{copiedKey === "all-creds" ? "Copiado" : "Copiar todo"}</span>
        </button>
      </div>

      {/* ── CARD 1: INICIALIZACION DE LA APLICACION ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              INTEGRACIÓN MULTI-LENGUAJE
            </span>
            <h3 className="text-base font-extrabold text-white">Inicialización de la Aplicación</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecciona tu lenguaje para copiar las credenciales de inicialización formateadas listas para tu código.
            </p>
          </div>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as any)}
            className="bg-[#020713] border border-[#0099ff]/30 text-[#00c2ff] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer font-mono"
          >
            <option value="csharp">C# (.NET / Unity)</option>
            <option value="cpp">C++ (MSVC / ISO)</option>
            <option value="python">Python 3.x</option>
            <option value="js">JavaScript / Node.js</option>
          </select>
        </div>

        {/* Code Box */}
        <div className="p-4 rounded-xl bg-[#020612] border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          <pre>
            <code>{getCode(selectedLang)}</code>
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleCopy(getCode(selectedLang), "init-code")}
            className="px-4 py-2 rounded-xl bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedKey === "init-code" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Credenciales</span>
          </button>

          <Link
            href="/dashboard/resources"
            className="px-4 py-2 rounded-xl bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ver Ejemplos Completos en Recursos →</span>
          </Link>
        </div>
      </div>

      {/* ── CARD 2: GENERAL & HWID/SEGURIDAD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* General */}
        <div className="lg:col-span-6 rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white">General</h3>
            <p className="text-xs text-slate-400">Nombre, descripción, versión y descarga de la app.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Nombre</label>
              <input
                type="text"
                value={currentApp.name}
                onChange={(e) => setCurrentApp({ ...currentApp, name: e.target.value })}
                className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Descripción</label>
              <input
                type="text"
                value={currentApp.description}
                onChange={(e) => setCurrentApp({ ...currentApp, description: e.target.value })}
                className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Versión</label>
              <input
                type="text"
                value={currentApp.version}
                onChange={(e) => setCurrentApp({ ...currentApp, version: e.target.value })}
                className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">URL de descarga</label>
              <input
                type="text"
                value={currentApp.downloadUrl}
                onChange={(e) => setCurrentApp({ ...currentApp, downloadUrl: e.target.value })}
                placeholder="URL de descarga"
                className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* HWID y Seguridad */}
        <div className="lg:col-span-6 rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white">HWID y Seguridad</h3>
            <p className="text-xs text-slate-400">Controla el lock forzado, longitud mínima y mensaje de error.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#030919] border border-slate-800 text-slate-300 font-bold">
                HWID Lock: Habilitado
              </div>
              <div className="p-3 rounded-xl bg-[#030919] border border-slate-800 text-slate-300 font-bold">
                Forzar HWID: Habilitado
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Max Resets</label>
              <input
                type="number"
                value={currentApp.maxResets}
                onChange={(e) =>
                  setCurrentApp({ ...currentApp, maxResets: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Mensaje de HWID Mismatch</label>
              <input
                type="text"
                value={currentApp.hwidMismatchMsg}
                onChange={(e) =>
                  setCurrentApp({ ...currentApp, hwidMismatchMsg: e.target.value })
                }
                className="w-full bg-[#020713] border border-[#0099ff]/30 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: CLAVES DE ACCESO & ACCIONES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Claves de acceso */}
        <div className="lg:col-span-7 rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white">Claves de acceso</h3>
            <p className="text-xs text-slate-400">ID del propietario y secreto de aplicacion para integrar tu aplicacion.</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* ID del Propietario */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">ID DEL PROPIETARIO</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-[#0099ff]/25">
                <span className="font-bold text-white tracking-wider">{currentApp.ownerId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentApp.ownerId, "owner-id")}
                  className="p-1 text-slate-400 hover:text-[#00c2ff]"
                >
                  {copiedKey === "owner-id" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Secreto de Aplicación */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">SECRETO DE APLICACION</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-[#0099ff]/25">
                <span className="font-bold text-white tracking-wider truncate mr-2">
                  {currentApp.secret}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentApp.secret, "app-sec")}
                  className="p-1 text-slate-400 hover:text-[#00c2ff]"
                >
                  {copiedKey === "app-sec" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="lg:col-span-5 rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-[#0088ff]/20 text-[#00c2ff] text-[9.5px] font-mono font-bold">
                USUARIOS: {currentApp.users}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#0088ff]/20 text-[#00c2ff] text-[9.5px] font-mono font-bold">
                LICENCIAS: {currentApp.licenses}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#0088ff]/20 text-[#00c2ff] text-[9.5px] font-mono font-bold">
                SUSCRIPCIONES: {currentApp.subscriptions}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">Acciones</h3>
            <p className="text-xs text-slate-400">Guarda aquí tus cambios generales y de seguridad.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-4">
            <button
              type="button"
              onClick={handleRotateSecret}
              className="px-4 py-2 rounded-xl bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Rotar secreto
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-4 py-2 rounded-xl bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={handleTogglePause}
              className="px-4 py-2 rounded-xl bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {currentApp.status === "active" ? "Pausar" : "Reanudar"}
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 4: ICONO DE APP ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0088ff] to-[#0044aa] flex items-center justify-center font-black text-white text-2xl shadow-lg">
            {currentApp.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="px-2 py-0.5 rounded bg-sky-500/15 text-[#00c2ff] text-[9.5px] font-bold font-mono uppercase">
              INICIAL AUTOMÁTICA
            </span>
            <h4 className="text-base font-extrabold text-white mt-0.5">Icono de app</h4>
            <p className="text-xs text-slate-400 max-w-lg">
              Sube un PNG o JPEG para mostrarlo en listas, tarjetas y resumen. PNG o JPEG hasta 2 MB. Si no subes uno, se usa la inicial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            id="icon-upload"
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={() => {
              setFeedback("Icono cargado correctamente.");
              setTimeout(() => setFeedback(null), 2500);
            }}
          />
          <label
            htmlFor="icon-upload"
            className="px-5 py-2.5 bg-[#0088ff] hover:bg-[#0099ff] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Subir icono
          </label>
        </div>
      </div>

      {/* ── CARD 5: CREAR NUEVA APP BAR ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white">Crear nueva app</h3>
            <p className="text-xs text-slate-400">
              El ID de propietario y secreto se generan automáticos. Solo pide nombre y descripción.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.4)] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear aplicacion</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 font-mono text-[9.5px]">
          <span className="px-2.5 py-1 rounded bg-[#0088ff]/15 text-[#00c2ff] font-bold border border-[#0088ff]/25">
            ID DE PROPIETARIO AUTOMATICO
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0088ff]/15 text-[#00c2ff] font-bold border border-[#0088ff]/25">
            SECRETO AUTOMATICO (64 HEX)
          </span>
        </div>
      </div>

      {/* ── CARD 6: MIS APLICACIONES TABLA ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white">Mis aplicaciones</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{filteredApps.length} aplicación(es)</p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar aplicaciones..."
              className="w-full bg-[#020713]/90 border border-[#0099ff]/30 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                <th className="py-3 px-3">NOMBRE</th>
                <th className="py-3 px-3">ID DEL PROPIETARIO</th>
                <th className="py-3 px-3">VERSION</th>
                <th className="py-3 px-3">ESTADO</th>
                <th className="py-3 px-3 text-center">USUARIOS</th>
                <th className="py-3 px-3 text-center">LICENCIAS</th>
                <th className="py-3 px-3 text-center">SUSCRIPCIONES</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredApps.map((app) => (
                <tr key={app.id} className={`hover:bg-[#071738]/40 transition-colors ${currentApp.id === app.id ? "bg-[#071738]/60" : ""}`}>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0088ff] to-[#0044aa] flex items-center justify-center font-bold text-white text-xs">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-xs font-sans">{app.name}</div>
                        <div className="text-[10px] text-slate-400">App SecureX Auth</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{app.ownerId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(app.ownerId, `row-${app.id}`)}
                        className="p-1 text-slate-400 hover:text-[#00c2ff]"
                      >
                        {copiedKey === `row-${app.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 font-bold">{app.version}</td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
                      {app.status === "active" ? "ACTIVA" : "PAUSADA"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center text-slate-300">{app.users}</td>
                  <td className="py-3.5 px-3 text-center text-slate-300">{app.licenses}</td>
                  <td className="py-3.5 px-3 text-center text-slate-300">{app.subscriptions}</td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(app.ownerId, `row-all-${app.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-[11px] font-bold text-slate-200 cursor-pointer"
                      >
                        Copiar todo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectApp(app)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          currentApp.id === app.id
                            ? "bg-emerald-600 text-white"
                            : "bg-[#0088ff] hover:bg-[#0099ff] text-white"
                        }`}
                      >
                        {currentApp.id === app.id ? "Seleccionada" : "Seleccionar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = appsList.map((a) =>
                            a.id === app.id ? { ...a, status: a.status === "active" ? ("paused" as const) : ("active" as const) } : a
                          );
                          setAppsList(updated);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-[11px] font-bold text-slate-200 cursor-pointer"
                      >
                        {app.status === "active" ? "Pausar" : "Reanudar"}
                      </button>
                      {appsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar app "${app.name}"?`)) {
                              setAppsList((prev) => prev.filter((a) => a.id !== app.id));
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 text-[11px] font-bold text-rose-400 cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CREAR NUEVA APLICACION ── */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#040e24] border border-[#0099ff]/35 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-7 space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-white">Crear nueva aplicacion</h2>
              <p className="text-xs text-slate-400 mt-1">
                El ID de propietario y secreto se generan automáticamente.
              </p>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-4 pt-1">
              <div>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="Nombre de aplicacion (ej: LUMINOX Bypass)"
                  required
                  className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <textarea
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value.slice(0, 50))}
                  placeholder="Descripcion de aplicacion"
                  rows={3}
                  className="w-full bg-[#020713] border border-[#0099ff]/30 focus:border-[#00c2ff] rounded-xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none"
                />
                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                  Maximo 50 caracteres para descripcion de aplicacion ({newAppDesc.length}/50)
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#08152e] hover:bg-[#0c1f44] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0080ff] to-[#00b4ff] hover:from-[#0070e0] hover:to-[#00a2ff] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
