"use client";

import React, { useState, useEffect } from "react";
import { Users, Coins, Sparkles } from "lucide-react";

interface DashboardStatsProps {
  initialOnlineUsersCount: number;
  initialActiveUsersCount: number;
  credits: number;
  isUnlimited: boolean;
  packagesCount: number;
}

export function DashboardStats({
  initialOnlineUsersCount,
  initialActiveUsersCount,
  credits,
  isUnlimited,
  packagesCount,
}: DashboardStatsProps) {
  const [onlineUsers, setOnlineUsers] = useState(initialOnlineUsersCount);
  const [activeUsers, setActiveUsers] = useState(initialActiveUsersCount);

  useEffect(() => {
    let isMounted = true;

    async function pollStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && isMounted) {
          setOnlineUsers(json.onlineUsersCount);
          setActiveUsers(json.activeUsersCount);
        }
      } catch (err) {
        console.error("Error polling stats:", err);
      }
    }

    // Poll every 5 seconds for real-time changes
    const interval = setInterval(pollStats, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const statsList = [
    {
      label: "USUARIOS ACTIVOS",
      value: onlineUsers,
      icon: Users,
      sub: `${activeUsers} Clientes registrados`,
    },
    {
      label: "CREDITOS DISPONIBLES",
      value: isUnlimited ? "Ilimitado" : credits.toFixed(1),
      icon: Coins,
      sub: isUnlimited ? "Plan sin costo" : "Monedas de generación",
    },
    {
      label: "COSTO BASE X USUARIO",
      value: "1.0",
      icon: Coins,
      sub: "Créditos por licencia",
    },
    {
      label: "PAQUETES",
      value: packagesCount,
      icon: Sparkles,
      sub: "Suscripciones activas",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statsList.map((s) => (
        <div
          key={s.label}
          className="premium-card-3d glassmorphism rounded-xl p-5 flex items-center justify-between border border-zinc-800/80 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</div>
            <div className="text-2xl font-black mt-1.5 font-mono text-zinc-150">{s.value}</div>
            <div className="text-[10px] text-zinc-500 mt-1.5 font-medium">{s.sub}</div>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded-lg text-emerald-400 shrink-0 shadow-inner hover:scale-105 transition duration-300">
            <s.icon className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      ))}
    </div>
  );
}
