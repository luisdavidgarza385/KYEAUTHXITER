"use client";
import React from "react";

export function ParticlesBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Ultra lightweight GPU-accelerated cyber glow ambient mesh (0% CPU load) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#0088ff]/10 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-[#00c2ff]/8 blur-[140px]" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#0055d4]/10 blur-[130px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#0099ff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07]" />
    </div>
  );
}
