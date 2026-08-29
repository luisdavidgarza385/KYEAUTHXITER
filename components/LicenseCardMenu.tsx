"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, RotateCcw, Ban, Trash2 } from "lucide-react";

export function LicenseCardMenu({ license, onUpdate, onDelete }: { license: { id: string; status: string; key: string }; onUpdate?: (lic: any) => void; onDelete?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function patch(body: any) {
    setBusy(true);
    const res = await fetch(`/api/admin/licenses/${license.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      alert(data.message || "Error");
      return;
    }
    setOpen(false);
    if (onUpdate) onUpdate(data.data || { ...license, ...body });
    router.refresh();
  }

  async function resetHwid() {
    setBusy(true);
    const res = await fetch(`/api/admin/licenses/${license.id}/reset-hwid`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.message || "Error");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function deleteLicense() {
    if (!confirm(`Delete license ${license.key}?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/licenses/${license.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.message || "Error");
      return;
    }
    setOpen(false);
    if (onDelete) onDelete();
    router.refresh();
  }

  function nextStatus() {
    if (license.status === "used") return "banned";
    if (license.status === "banned") return "unused";
    return "banned";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border border-border text-text-muted hover:bg-bg-hover hover:text-text transition"
        disabled={busy}
      >
        Acciones <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[180px] rounded-md border border-border bg-bg-card shadow-xl overflow-hidden">
          <button onClick={resetHwid} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-hover">
            <RotateCcw className="w-3.5 h-3.5" /> Reset HWID
          </button>
          <button onClick={() => patch({ status: nextStatus() })} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-hover border-t border-border">
            <Ban className="w-3.5 h-3.5" /> {license.status === "banned" ? "Desbanear" : "Banear"}
          </button>
          <button onClick={deleteLicense} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-danger/10 text-danger border-t border-border">
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
