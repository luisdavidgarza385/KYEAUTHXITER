"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Camera, Key, CheckCircle2, AlertCircle, Save, Sparkles, Image as ImageIcon, Check } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [sellerLabel, setSellerLabel] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Preset Avatars
  const AVATAR_PRESETS = [
    { name: "Sukuna Icon", url: "/logo.png" },
    { name: "Cyberpunk Male", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberMale" },
    { name: "Cyberpunk Female", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberFemale" },
    { name: "Bot Assistant", url: "https://api.dicebear.com/7.x/bottts/svg?seed=SukunaBot" },
    { name: "Neon Skull", url: "https://api.dicebear.com/7.x/identicon/svg?seed=NeonSkull" },
    { name: "VIP Shield", url: "https://api.dicebear.com/7.x/shapes/svg?seed=VIPShield" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      // Check local storage override first
      const storedAvatar = localStorage.getItem("spectral_x_avatar");
      if (storedAvatar) setAvatarUrl(storedAvatar);

      const res = await fetch("/api/admin/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUserEmail(json.data.email);
          setUserRole(json.data.role);
          setSellerLabel(json.data.seller_label || json.data.email.split("@")[0]);
          if (json.data.avatar_url && !storedAvatar) {
            setAvatarUrl(json.data.avatar_url);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: "Las contraseñas no coinciden." });
      return;
    }

    if (newPassword && newPassword.length < 5) {
      setStatus({ type: "error", msg: "La nueva contraseña debe tener al menos 5 caracteres." });
      return;
    }

    setSaving(true);
    try {
      // Save locally to localStorage for instant UI responsiveness
      if (avatarUrl) {
        localStorage.setItem("spectral_x_avatar", avatarUrl);
        window.dispatchEvent(new CustomEvent("spectral-avatar-updated"));
      }

      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl,
          sellerLabel,
          newPassword: newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStatus({ type: "success", msg: "✅ Perfil y avatar actualizados exitosamente." });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus({ type: "error", msg: json.message || "Error al actualizar perfil." });
      }
    } catch {
      setStatus({ type: "error", msg: "Error de red al actualizar perfil." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500/50 border-t-sky-400 rounded-full animate-spin" />
      </div>
    );
  }

  const currentDisplayAvatar = avatarUrl || "/logo.png";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <User className="w-7 h-7 text-sky-400" />
          Perfil y Foto de Usuario
        </h1>
        <p className="text-sm text-zinc-400">
          Personaliza tu foto de perfil, nombre visible y contraseña de acceso en SecureX Auth.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Main Card */}
        <div className="glassmorphism p-6 rounded-2xl border border-sky-500/20 bg-[#030914]/80 backdrop-blur-xl shadow-2xl space-y-6">
          
          {/* Avatar Preview Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-sky-950/20 border border-sky-500/20">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-sky-500/40 shadow-xl shadow-sky-500/20 bg-[#050e20] flex items-center justify-center">
                <img src={currentDisplayAvatar} alt="Foto de Perfil" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-sky-400" />
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                {sellerLabel || userEmail}
                <Sparkles className="w-4 h-4 text-sky-400" />
              </h3>
              <p className="text-xs text-zinc-400 font-mono">{userEmail}</p>
              <div className="pt-1">
                <span className="inline-block text-[10px] font-extrabold uppercase font-mono tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-md">
                  {userRole === "admin" ? "ADMINISTRADOR" : userRole === "developer" ? "DESARROLLADOR" : "REVENDEDOR"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-sky-500/10" />

          {/* Preset Avatars Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80 mb-2.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-sky-400" /> Elegir Avatar Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setAvatarUrl(preset.url)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    avatarUrl === preset.url
                      ? "bg-sky-500/20 border-sky-500/50 shadow-md shadow-sky-500/20 scale-105"
                      : "bg-[#020610] border-sky-500/10 hover:bg-sky-500/10"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-sky-500/30">
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-300 truncate w-full text-center">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Avatar URL */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80 mb-1.5 block">
              O Pega una URL de Imagen Personalizada (Foto de tu ordenador o internet)
            </label>
            <input
              type="text"
              className="w-full bg-[#020610] border border-sky-500/20 text-white placeholder:text-zinc-600 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500/60 transition font-mono"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://ejemplo.com/tu_foto.png"
            />
          </div>

          {/* Display Name Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80 mb-1.5 block">
              Nombre Visible / Usuario
            </label>
            <input
              type="text"
              className="w-full bg-[#020610] border border-sky-500/20 text-white placeholder:text-zinc-600 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500/60 transition"
              value={sellerLabel}
              onChange={(e) => setSellerLabel(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>

          <div className="h-px bg-sky-500/10" />

          {/* Change Password Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-400" />
              Cambiar Contraseña (Opcional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  className="w-full bg-[#020610] border border-sky-500/20 text-white placeholder:text-zinc-600 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500/60 transition"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  className="w-full bg-[#020610] border border-sky-500/20 text-white placeholder:text-zinc-600 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500/60 transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              status.type === "success"
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400"
                : "bg-red-950/30 border-red-500/40 text-red-400"
            }`}>
              {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {status.msg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Guardando Cambios..." : "Guardar Perfil y Avatar"}
          </button>
        </div>
      </form>
    </div>
  );
}
