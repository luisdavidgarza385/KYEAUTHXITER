"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Coins, Sparkles } from "lucide-react";

interface DashboardStatsProps {
  initialOnlineUsersCount: number;
  initialActiveUsersCount: number;
  credits: number;
  isUnlimited: boolean;
  packagesCount: number;
}

function StatCard3D({ s }: { s: any }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Max rotation 12 degrees
    const rotateX = -(y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="transition-all duration-200 ease-out rounded-xl p-5 bg-gradient-to-br from-[#0c180f] to-[#040905] border border-emerald-500/15 relative overflow-hidden flex items-center justify-between"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovered ? 1.03 : 1})`,
        transformStyle: "preserve-3d",
        boxShadow: isHovered 
          ? "0 20px 40px -10px rgba(16, 185, 129, 0.25), 0 0 25px rgba(16, 185, 129, 0.12)" 
          : "0 10px 25px -10px rgba(0, 0, 0, 0.5)"
      }}
    >
      {/* Glowing Backdrop inside */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-radial from-emerald-500/5 to-transparent pointer-events-none opacity-80" />
      )}
      
      <div style={{ transform: "translateZ(20px)" }}>
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-450">{s.label}</div>
        <div className="text-3xl font-black mt-2 font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">{s.value}</div>
        <div className="text-[10px] text-zinc-550 mt-2 font-semibold">{s.sub}</div>
      </div>
      
      <div 
        style={{ transform: "translateZ(30px)" }} 
        className="p-3 bg-[#081f12] border border-emerald-500/20 rounded-lg text-emerald-450 shrink-0 shadow-inner group-hover:scale-105 transition duration-300"
      >
        <s.icon className="w-6 h-6 text-emerald-400" />
      </div>
    </div>
  );
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
        <StatCard3D key={s.label} s={s} />
      ))}
    </div>
  );
}
