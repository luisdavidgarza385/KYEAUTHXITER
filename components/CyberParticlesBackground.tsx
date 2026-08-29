"use client";

import React from "react";

export function CyberParticlesBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* High Performance GPU-accelerated Cyber glow background */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0088ff]/10 blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[#0055d4]/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#0099ff_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06]" />
    </div>
  );
}
