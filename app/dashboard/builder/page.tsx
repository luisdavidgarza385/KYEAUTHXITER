"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, Wrench, Plus, Upload, Download, Trash, RefreshCw, 
  Copy, Check, FileCode, CheckCircle2, AlertTriangle, Settings, FolderClosed, Cpu, Info,
  MessageCircle, Send, X as XIcon
} from "lucide-react";

// API endpoints — all served locally from keyauthpro.xyz
const API_BASE = "";
const API = `/api/builder`;

interface DllInfo {
  name: string;
  size?: number;
  uploadedAt?: string;
}

interface Project {
  id: string;
  name: string;
  exeTitle: string;
  process: string;
  color: string;
  hasIcon?: boolean;
  dlls?: DllInfo[];
  keyAuthName?: string;
  keyAuthOwner?: string;
  keyAuthVer?: string;
  keyAuthSecret?: string;
}

const PRESETS = [
  { name: "Purple", hex: "#9333ea" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Green", hex: "#22c55e" },
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#eab308" },
  { name: "White", hex: "#e2e8f0" },
];

export default function BuilderPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDllsOpen, setIsDllsOpen] = useState(false);
  const [activeProj, setActiveProj] = useState<Project | null>(null);

  // Forms state
  const [formName, setFormName] = useState("");
  const [formProc, setFormProc] = useState("HD-Player.exe");
  const [formExe, setFormExe] = useState("");
  const [formColor, setFormColor] = useState("#9333ea");
  const [formKaName, setFormKaName] = useState("");
  const [formKaOwner, setFormKaOwner] = useState("");
  const [formKaVer, setFormKaVer] = useState("1.0");
  const [formKaSecret, setFormKaSecret] = useState("");
  
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build statuses tracking
  const [buildStatuses, setBuildStatuses] = useState<Record<string, { status: string; file?: string; error?: string }>>({});

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatProject, setChatProject] = useState<Project | null>(null);
  const [chatChannel, setChatChannel] = useState("global");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef2 = useRef<HTMLDivElement>(null);

  // Fetch all projects
  const loadProjects = async () => {
    try {
      const res = await fetch(`${API}/projects?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        // Fetch compile status for each project
        data.forEach((p: Project) => {
          checkBuildStatus(p.id);
        });
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // ── CHAT HELPERS ──
  const fetchChatMessages = async (channel: string) => {
    try {
      const r = await fetch(`${API}/chat?channel=${encodeURIComponent(channel)}`);
      if (r.ok) {
        const data = await r.json();
        setChatMessages(data.messages || []);
        setTimeout(() => chatEndRef2.current?.scrollIntoView({ behavior: "smooth" }), 60);
      }
    } catch {}
  };

  const openChat = (p: Project) => {
    setChatProject(p);
    const ch = p.id;
    setChatChannel(ch);
    setChatMessages([]);
    setIsChatOpen(true);
    fetchChatMessages(ch);
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(() => fetchChatMessages(ch), 2000);
  };

  const closeChat = () => {
    if (chatPollRef.current) { clearInterval(chatPollRef.current); chatPollRef.current = null; }
    setIsChatOpen(false);
    setChatProject(null);
    setChatMessages([]);
    setChatInput("");
  };

  const sendChatMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatSending) return;
    setChatSending(true);
    try {
      await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: chatChannel, username: "Admin", role: "admin", text: chatInput.trim() })
      });
      setChatInput("");
      await fetchChatMessages(chatChannel);
    } catch {}
    finally { setChatSending(false); }
  };

  const clearChat = async () => {
    if (!confirm("¿Borrar todos los mensajes de este canal?")) return;
    await fetch(`${API}/chat`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: chatChannel, key: "Dark Hacks-L60K-VT2U-T7QK-00MV" })
    });
    setChatMessages([]);
  };

  const checkBuildStatus = async (pid: string) => {
    try {
      const r = await fetch(`${API}/projects/${pid}/build-status`);
      if (r.ok) {
        const statusData = await r.json();
        setBuildStatuses(prev => ({
          ...prev,
          [pid]: statusData
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toast notification helper
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"ok" | "err">("ok");
  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Copy to clipboard
  const handleCopy = (fieldId: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(fieldId);
    showToast("Copiado al portapapeles ✓");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formExe.trim()) {
      showToast("Completa todos los campos obligatorios", "err");
      return;
    }

    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          process: formProc,
          exeTitle: formExe,
          color: formColor,
          keyAuthName: formKaName,
          keyAuthOwner: formKaOwner,
          keyAuthVer: formKaVer,
          keyAuthSecret: formKaSecret
        })
      });

      if (res.ok) {
        const newProj = await res.json();
        
        // Upload icon if selected
        if (iconFile) {
          const formData = new FormData();
          formData.append("file", iconFile);
          await fetch(`${API}/projects/${newProj.id}/icon`, {
            method: "POST",
            body: formData
          });
        }

        showToast("Proyecto creado con éxito");
        setIsCreateOpen(false);
        resetForm();
        loadProjects();
      } else {
        showToast("Error al crear el proyecto", "err");
      }
    } catch (err) {
      showToast("Fallo al conectar con el servidor", "err");
    }
  };

  // Open Settings Modal
  const openSettings = (p: Project) => {
    setActiveProj(p);
    setFormName(p.name);
    setFormProc(p.process);
    setFormExe(p.exeTitle);
    setFormColor(p.color || "#9333ea");
    setFormKaName(p.keyAuthName || "");
    setFormKaOwner(p.keyAuthOwner || "");
    setFormKaVer(p.keyAuthVer || "1.0");
    setFormKaSecret(p.keyAuthSecret || "");
    setIconPreview(p.hasIcon ? `/api/builder/files/icons/${p.id}.png?t=${Date.now()}` : null);
    setIconFile(null);
    setIsSettingsOpen(true);
  };

  // Save Settings Changes
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProj) return;

    try {
      const res = await fetch(`${API}/projects/${activeProj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          exeTitle: formExe,
          process: formProc,
          color: formColor,
          keyAuthName: formKaName,
          keyAuthOwner: formKaOwner,
          keyAuthVer: formKaVer,
          keyAuthSecret: formKaSecret
        })
      });

      if (res.ok) {
        // Upload icon if selected
        if (iconFile) {
          const formData = new FormData();
          formData.append("file", iconFile);
          await fetch(`${API}/projects/${activeProj.id}/icon`, {
            method: "POST",
            body: formData
          });
        }

        showToast("Cambios guardados correctamente");
        setIsSettingsOpen(false);
        loadProjects();
      } else {
        showToast("Error al actualizar la configuración", "err");
      }
    } catch (err) {
      showToast("Fallo al guardar configuración", "err");
    }
  };

  // Delete Project
  const handleDeleteProject = async (pid: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el proyecto "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`${API}/projects/${pid}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Proyecto eliminado");
        loadProjects();
      } else {
        showToast("Error al eliminar el proyecto", "err");
      }
    } catch (err) {
      showToast("Error de conexión", "err");
    }
  };

  // Compile Loader EXE
  const handleCompile = async (pid: string) => {
    showToast("⚙ Iniciando compilación del loader...");
    setBuildStatuses(prev => ({
      ...prev,
      [pid]: { status: "compiling" }
    }));

    try {
      await fetch(`${API}/projects/${pid}/compile`, { method: "POST" });
      
      let tries = 0;
      const poll = setInterval(async () => {
        tries++;
        const r = await fetch(`${API}/projects/${pid}/build-status`);
        if (r.ok) {
          const build = await r.json();
          setBuildStatuses(prev => ({
            ...prev,
            [pid]: build
          }));

          if (build.status === "success" || build.status === "error" || tries > 60) {
            clearInterval(poll);
            loadProjects();
            if (build.status === "success") {
              showToast("✅ Loader compilado con éxito");
            } else {
              showToast("❌ Error en la compilación", "err");
            }
          }
        }
      }, 1500);
    } catch (err) {
      setBuildStatuses(prev => ({
        ...prev,
        [pid]: { status: "error", error: "Fallo de comunicación con la API de compilación" }
      }));
      showToast("Fallo al iniciar compilación", "err");
    }
  };

  const handleClearBuild = async (pid: string) => {
    try {
      await fetch(`${API}/projects/${pid}/clear-build`, { method: "POST" });
      checkBuildStatus(pid);
    } catch (e) {
      console.error(e);
    }
  };

  // Icon upload helper
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // DLL Upload & Management
  const [dllUploadFile, setDllUploadFile] = useState<File | null>(null);
  const [uploadingDll, setUploadingDll] = useState(false);

  const openDlls = (p: Project) => {
    setActiveProj(p);
    setDllUploadFile(null);
    setIsDllsOpen(true);
  };

  const handleUploadDll = async () => {
    if (!activeProj || !dllUploadFile) return;
    setUploadingDll(true);

    try {
      const formData = new FormData();
      formData.append("file", dllUploadFile);

      const res = await fetch(`${API}/projects/${activeProj.id}/dlls`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        showToast("Módulo DLL subido correctamente");
        setDllUploadFile(null);
        // Refresh active project DLL list
        const updatedRes = await fetch(`${API}/projects?t=${Date.now()}`);
        if (updatedRes.ok) {
          const updatedProjects = await updatedRes.json();
          setProjects(updatedProjects);
          const found = updatedProjects.find((x: Project) => x.id === activeProj.id);
          if (found) setActiveProj(found);
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Error al subir la DLL", "err");
      }
    } catch (err) {
      showToast("Error de red al subir la DLL", "err");
    } finally {
      setUploadingDll(false);
    }
  };

  const handleUploadBaseLoader = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    showToast("Subiendo Base Loader...");

    try {
      const res = await fetch(`${API}/upload-base-loader`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        showToast("✅ Base Loader subido con éxito");
      } else {
        const data = await res.json();
        showToast(data.error || "Error al subir el Base Loader", "err");
      }
    } catch (err) {
      showToast("Fallo al conectar con el servidor", "err");
    }
  };

  const handleDeleteDll = async (filename: string) => {
    if (!activeProj) return;
    if (!confirm(`¿Eliminar el módulo "${filename}"?`)) return;

    try {
      const res = await fetch(`${API}/projects/${activeProj.id}/dlls/${filename}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showToast("Módulo eliminado");
        const updatedRes = await fetch(`${API}/projects?t=${Date.now()}`);
        if (updatedRes.ok) {
          const updatedProjects = await updatedRes.json();
          setProjects(updatedProjects);
          const found = updatedProjects.find((x: Project) => x.id === activeProj.id);
          if (found) setActiveProj(found);
        }
      } else {
        showToast("No se pudo eliminar el módulo", "err");
      }
    } catch (e) {
      showToast("Error de conexión", "err");
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormProc("HD-Player.exe");
    setFormExe("");
    setFormColor("#9333ea");
    setFormKaName("");
    setFormKaOwner("");
    setFormKaVer("1.0");
    setFormKaSecret("");
    setIconFile(null);
    setIconPreview(null);
  };

  // Helper for rendering badges
  const getDllBadge = (name: string) => {
    const s = name.toLowerCase();
    if (s.includes("supreme")) return "bg-purple-950/45 text-purple-400 border border-purple-500/20";
    if (s.includes("basic") || s.includes("basico")) return "bg-blue-950/45 text-blue-400 border border-blue-500/20";
    return "bg-emerald-950/45 text-emerald-400 border border-emerald-500/20";
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    return bytes < 1048576 
      ? `${(bytes / 1024).toFixed(1)} KB` 
      : `${(bytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 text-zinc-100 font-sans">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-xl backdrop-blur-md animate-[fadeIn_0.3s_ease] border ${
          toastType === "ok" 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300" 
            : "bg-red-950/80 border-red-500/30 text-red-300"
        }`}>
          <span>{toastType === "ok" ? "✓" : "✕"}</span>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            Loader Builder & Módulos
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Unifica la compilación de tus Loaders de Spectral X y administra tus DLLs conectadas a KeyAuth.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <input 
            type="file" 
            id="baseLoaderInput" 
            accept=".exe" 
            className="hidden" 
            onChange={handleUploadBaseLoader}
          />
          <button 
            onClick={() => document.getElementById("baseLoaderInput")?.click()}
            className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-xs px-4 py-2.5 shadow-md transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-zinc-400" />
            Subir Base Loader
          </button>
          
          <button 
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 shadow-md shadow-emerald-950/50 transition cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Crear Aplicación
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-emerald-400 group-hover:scale-110 transition"><Terminal className="w-12 h-12"/></div>
          <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Total Aplicaciones</div>
          <div className="text-3xl font-bold font-mono text-zinc-100">{projects.length}</div>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-emerald-400 group-hover:scale-110 transition"><Wrench className="w-12 h-12"/></div>
          <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Loaders Compilados</div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {Object.values(buildStatuses).filter(b => b.status === "success").length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-emerald-400 group-hover:scale-110 transition"><FolderClosed className="w-12 h-12"/></div>
          <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Módulos DLL Conectados</div>
          <div className="text-3xl font-bold font-mono text-zinc-100">
            {projects.reduce((acc, p) => acc + (p.dlls ? p.dlls.length : 0), 0)}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-sm font-semibold">Cargando la consola del Builder...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/5 text-center py-16 px-4">
          <Terminal className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-semibold text-zinc-200">No tienes aplicaciones de compilación todavía</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto">
            Inicializa tu primer loader configurando su nombre, icono, color y credenciales de KeyAuth para empezar.
          </p>
          <button 
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="mt-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs px-3.5 py-2 transition cursor-pointer"
          >
            Añadir Primer Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p) => {
            const build = buildStatuses[p.id];
            const isKaConfigured = p.keyAuthName && p.keyAuthOwner && p.keyAuthSecret;

            return (
              <div 
                key={p.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/45 hover:border-emerald-500/25 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-inner group relative"
                style={{ 
                  boxShadow: `inset 0 0 20px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.15)`
                }}
              >
                {/* Visual Accent bar at the top */}
                <div className="h-1 w-full" style={{ backgroundColor: p.color || "#9333ea" }}></div>

                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-white shadow-md relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${p.color || "#9333ea"}, ${p.color ? p.color + "99" : "#7928ca"})` }}
                      >
                        {p.hasIcon ? (
                          <img 
                            src={`/api/builder/files/icons/${p.id}.png?t=${Date.now()}`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          p.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-zinc-100 text-sm md:text-base leading-snug truncate">
                          {p.name}
                        </h3>
                        <div className="text-[10.5px] font-mono text-zinc-500 truncate mt-0.5">
                          {p.process}
                        </div>
                      </div>
                    </div>
                    
                    {/* Settings / Gear button */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => openSettings(p)}
                        className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                        title="Configurar Aplicación"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(p.id, p.name)}
                        className="p-2 rounded-lg bg-zinc-900/80 hover:bg-red-950/20 border border-zinc-850 hover:border-red-900/30 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                        title="Eliminar Proyecto"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Config Indicators Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {isKaConfigured ? (
                      <span className="text-[9.5px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                        🔑 KeyAuth OK
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20">
                        ⚠️ Sin KeyAuth
                      </span>
                    )}
                    <span className="text-[9.5px] font-semibold tracking-wide px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {p.dlls ? p.dlls.length : 0} Módulos
                    </span>
                  </div>

                  {/* Credentials block */}
                  <div className="rounded-lg bg-black/35 border border-zinc-900/60 p-3 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-500">App Name:</span>
                      <span className="font-mono text-zinc-300 font-semibold truncate max-w-[170px] flex items-center gap-1">
                        {p.keyAuthName || "---"}
                        {p.keyAuthName && (
                          <button 
                            onClick={() => handleCopy(`kan-${p.id}`, p.keyAuthName || "")}
                            className="text-zinc-600 hover:text-emerald-400 cursor-pointer"
                          >
                            {copiedField === `kan-${p.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-500">Owner ID:</span>
                      <span className="font-mono text-zinc-300 font-semibold truncate max-w-[170px] flex items-center gap-1">
                        {p.keyAuthOwner ? `${p.keyAuthOwner.substring(0, 8)}...` : "---"}
                        {p.keyAuthOwner && (
                          <button 
                            onClick={() => handleCopy(`kao-${p.id}`, p.keyAuthOwner || "")}
                            className="text-zinc-600 hover:text-emerald-400 cursor-pointer"
                          >
                            {copiedField === `kao-${p.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-500">Secret Key:</span>
                      <span className="font-mono text-zinc-300 font-semibold truncate max-w-[170px] flex items-center gap-1">
                        {p.keyAuthSecret ? `${p.keyAuthSecret.substring(0, 8)}...` : "---"}
                        {p.keyAuthSecret && (
                          <button 
                            onClick={() => handleCopy(`kas-${p.id}`, p.keyAuthSecret || "")}
                            className="text-zinc-600 hover:text-emerald-400 cursor-pointer"
                          >
                            {copiedField === `kas-${p.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="bg-black/10 border-t border-zinc-900/60 p-4 flex items-center justify-between gap-3 mt-auto">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openDlls(p)}
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-xs font-semibold px-3 py-2 transition cursor-pointer text-zinc-300"
                    >
                      📁 DLLs
                    </button>
                    <button 
                      onClick={() => openSettings(p)}
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-xs font-semibold px-3 py-2 transition cursor-pointer text-zinc-300"
                    >
                      ⚙ Config
                    </button>
                    <button 
                      onClick={() => openChat(p)}
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-emerald-600/40 text-xs font-semibold px-3 py-2 transition cursor-pointer text-emerald-400 flex items-center gap-1.5"
                      title="Chat de Soporte"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </button>
                  </div>

                  {/* Compile state / Build action button */}
                  <div>
                    {build?.status === "compiling" ? (
                      <button 
                        disabled
                        className="rounded-lg bg-zinc-900 border border-zinc-850 text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 text-zinc-400"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Compilando...
                      </button>
                    ) : build?.status === "success" && build.file ? (
                      <div className="flex items-center gap-1">
                        <a 
                          href={`/api/builder/files/builds/${build.file}`} 
                          download
                          onClick={() => handleClearBuild(p.id)}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </a>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleCompile(p.id)}
                        className="rounded-lg text-white text-xs font-semibold px-3.5 py-2 flex items-center gap-1 shadow-sm transition hover:scale-[1.02] cursor-pointer"
                        style={{ 
                          background: `linear-gradient(135deg, ${p.color || "#9333ea"}, ${p.color ? p.color + "cc" : "#7928ca"})`,
                          boxShadow: `0 4px 10px rgba(0,0,0,0.15)`
                        }}
                      >
                        ⚡ Compilar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Nueva Aplicación
              </h2>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Nombre del Proyecto</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ej: Guate Xiter"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Proceso Target</label>
                  <input 
                    type="text" 
                    value={formProc} 
                    onChange={(e) => setFormProc(e.target.value)}
                    placeholder="ej: HD-Player.exe"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Nombre del EXE Generado</label>
                <input 
                  type="text" 
                  value={formExe} 
                  onChange={(e) => setFormExe(e.target.value)}
                  placeholder="ej: Spectral_loader"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Icon upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ícono del Loader</label>
                <div className="flex items-center gap-3 border border-zinc-850 bg-zinc-900/30 rounded-xl p-3.5">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 flex items-center justify-center text-zinc-500 cursor-pointer overflow-hidden shadow-inner shrink-0"
                  >
                    {iconPreview ? (
                      <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-300 block">Icono en formato PNG</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Se recomienda fondo transparente e ICO/PNG.</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleIconChange} 
                      accept=".png,.jpg,.ico" 
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>

              {/* Theme color grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Color del Tema</label>
                <div className="flex flex-wrap gap-2 items-center bg-zinc-900/30 border border-zinc-850 p-3 rounded-xl">
                  {PRESETS.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setFormColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition cursor-pointer hover:scale-110 ${
                        formColor === c.hex ? "border-white scale-105" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={formColor} 
                    onChange={(e) => setFormColor(e.target.value)} 
                    className="w-7 h-7 border-none bg-none rounded-lg cursor-pointer p-0 shrink-0"
                    title="Color Personalizado"
                  />
                </div>
              </div>

              {/* KeyAuth Credentials Header toggle */}
              <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-850 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 border-b border-zinc-850/60 pb-2">
                  <Info className="w-4.5 h-4.5 text-emerald-400" />
                  Credenciales KeyAuth (Opcional)
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">App Name</label>
                    <input 
                      type="text" 
                      value={formKaName} 
                      onChange={(e) => setFormKaName(e.target.value)}
                      placeholder="Nombre en KeyAuth"
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Owner ID</label>
                    <input 
                      type="text" 
                      value={formKaOwner} 
                      onChange={(e) => setFormKaOwner(e.target.value)}
                      placeholder="Owner ID"
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Version</label>
                    <input 
                      type="text" 
                      value={formKaVer} 
                      onChange={(e) => setFormKaVer(e.target.value)}
                      placeholder="1.0"
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Secret Key</label>
                    <input 
                      type="text" 
                      value={formKaSecret} 
                      onChange={(e) => setFormKaSecret(e.target.value)}
                      placeholder="KeyAuth Secret"
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/45 transition cursor-pointer"
                >
                  ＋ Crear Aplicación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS / CONFIG MODAL */}
      {isSettingsOpen && activeProj && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                Configurar: {activeProj.name}
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Nombre del Proyecto</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Proceso Target</label>
                  <input 
                    type="text" 
                    value={formProc} 
                    onChange={(e) => setFormProc(e.target.value)}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Nombre del EXE Generado</label>
                <input 
                  type="text" 
                  value={formExe} 
                  onChange={(e) => setFormExe(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Icon upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ícono del Loader</label>
                <div className="flex items-center gap-3 border border-zinc-850 bg-zinc-900/30 rounded-xl p-3.5">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 flex items-center justify-center text-zinc-500 cursor-pointer overflow-hidden shadow-inner shrink-0"
                  >
                    {iconPreview ? (
                      <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-300 block">Actualizar Ícono</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Formatos ICO o PNG recomendados.</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleIconChange} 
                      accept=".png,.jpg,.ico" 
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>

              {/* Theme color grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Color del Tema</label>
                <div className="flex flex-wrap gap-2 items-center bg-zinc-900/30 border border-zinc-850 p-3 rounded-xl">
                  {PRESETS.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setFormColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition cursor-pointer hover:scale-110 ${
                        formColor === c.hex ? "border-white scale-105" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={formColor} 
                    onChange={(e) => setFormColor(e.target.value)} 
                    className="w-7 h-7 border-none bg-none rounded-lg cursor-pointer p-0 shrink-0"
                  />
                </div>
              </div>

              {/* KeyAuth Credentials */}
              <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-850 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 border-b border-zinc-850/60 pb-2">
                  <Info className="w-4.5 h-4.5 text-emerald-400" />
                  Credenciales KeyAuth de la Aplicación
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">App Name</label>
                    <input 
                      type="text" 
                      value={formKaName} 
                      onChange={(e) => setFormKaName(e.target.value)}
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Owner ID</label>
                    <input 
                      type="text" 
                      value={formKaOwner} 
                      onChange={(e) => setFormKaOwner(e.target.value)}
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Version</label>
                    <input 
                      type="text" 
                      value={formKaVer} 
                      onChange={(e) => setFormKaVer(e.target.value)}
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Secret Key</label>
                    <input 
                      type="text" 
                      value={formKaSecret} 
                      onChange={(e) => setFormKaSecret(e.target.value)}
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DLLS MANAGEMENT MODAL */}
      {isDllsOpen && activeProj && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 truncate">
                  <FolderClosed className="w-5 h-5 text-emerald-400 shrink-0" />
                  Módulos DLL: {activeProj.name}
                </h2>
                <p className="text-[10.5px] text-zinc-500 mt-0.5 truncate">Sube y remueve los módulos de inyección para el emulador ({activeProj.process}).</p>
              </div>
              <button 
                onClick={() => setIsDllsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-zinc-800 bg-zinc-950/20 rounded-xl p-6 text-center space-y-3 relative">
                <input 
                  type="file" 
                  accept=".dll"
                  onChange={(e) => setDllUploadFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploadingDll}
                />
                <FileCode className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  {dllUploadFile ? (
                    <span className="text-xs font-bold text-emerald-400 block">{dllUploadFile.name} ({formatSize(dllUploadFile.size)})</span>
                  ) : (
                    <span className="text-xs font-bold text-zinc-300 block">Selecciona o arrastra un módulo .dll</span>
                  )}
                  <span className="text-[10px] text-zinc-500 block">Archivos dinámicos ejecutables compilados de C++/Rust.</span>
                </div>
                
                {dllUploadFile && (
                  <button
                    onClick={handleUploadDll}
                    disabled={uploadingDll}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white text-xs font-bold px-3 py-2 transition"
                  >
                    {uploadingDll ? <RefreshCw className="w-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Subir Módulo Ahora
                  </button>
                )}
              </div>

              {/* DLLs List */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Módulos Cargados ({activeProj.dlls ? activeProj.dlls.length : 0})</h3>
                
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {!activeProj.dlls || activeProj.dlls.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-xs">
                      No hay ningún módulo de inyección configurado para esta aplicación.
                    </div>
                  ) : (
                    activeProj.dlls.map((d, index) => (
                      <div 
                        key={d.name + index} 
                        className="rounded-lg bg-zinc-950/50 border border-zinc-900 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCode className="w-4 h-4 text-zinc-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-200 block truncate">{d.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{formatSize(d.size)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[9.5px] font-bold tracking-wide px-2 py-0.5 rounded ${getDllBadge(d.name)}`}>
                            {d.name.toLowerCase().includes("supreme") ? "Supreme" : d.name.toLowerCase().includes("basic") ? "Basic" : "Custom"}
                          </span>
                          <button 
                            onClick={() => handleDeleteDll(d.name)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-850 hover:border-red-900/30 text-zinc-500 hover:text-red-400 cursor-pointer"
                            title="Eliminar Módulo"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {isChatOpen && chatProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col overflow-hidden shadow-2xl" style={{height: '85vh', maxHeight: 620}}>
            {/* Chat header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0" style={{ borderTop: `3px solid ${chatProject.color || '#9333ea'}` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: chatProject.color || '#9333ea' }}>
                  {chatProject.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-zinc-100 text-sm leading-tight">{chatProject.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">canal: {chatChannel}</div>
                </div>
                <span className="ml-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>En vivo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearChat} className="text-[10px] text-zinc-600 hover:text-red-400 px-2 py-1 rounded border border-zinc-800 hover:border-red-900/40 transition cursor-pointer">Limpiar</button>
                <button onClick={closeChat} className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-xs">Sin mensajes en este canal aún.</p>
                  <p className="text-[10px] text-zinc-700">Los usuarios del loader envían mensajes aquí.</p>
                </div>
              ) : chatMessages.map((msg: any) => (
                <div key={msg.id} className={`flex gap-2.5 ${ msg.role === 'admin' ? 'flex-row-reverse' : 'flex-row' }`}>
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${ msg.role === 'admin' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'bg-zinc-800 text-zinc-300 border border-zinc-700' }`}>
                    {msg.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className={`max-w-[78%] rounded-xl px-3 py-2 ${ msg.role === 'admin' ? 'bg-emerald-950/40 border border-emerald-800/30' : 'bg-zinc-900/80 border border-zinc-800/60' }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[10px] font-bold ${ msg.role === 'admin' ? 'text-emerald-400' : 'text-zinc-300' }`}>{msg.username || 'Usuario'}</span>
                      {msg.role === 'admin' && <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-emerald-950 text-emerald-500 border border-emerald-800/40">Admin</span>}
                    </div>
                    <p className="text-[12px] text-zinc-200 leading-relaxed">{msg.text}</p>
                    <div className="text-[9px] text-zinc-600 mt-1 font-mono">{msg.date ? new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef2} />
            </div>

            {/* Input area */}
            <form onSubmit={sendChatMsg} className="p-3 border-t border-zinc-800 flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe un mensaje como Admin..."
                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition"
                autoFocus
              />
              <button
                type="submit"
                disabled={chatSending || !chatInput.trim()}
                className="rounded-lg px-3 py-2 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-40"
                style={{ background: chatProject.color || '#9333ea' }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple loader helper inside same file
function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={className} />;
}
