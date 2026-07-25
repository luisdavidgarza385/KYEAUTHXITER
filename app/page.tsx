"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { 
  Zap, Key, Users, Server, BarChart3, Lock, Globe, Sparkles, 
  ArrowRight, ShieldCheck, Check, Terminal, Play, Cpu, ShieldAlert,
  Shield, Code2, Layers, RefreshCw, FileText, ChevronRight, Activity
} from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";

// Interactive 3D tilt wrapper component for dashboard preview
function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = -(y / (rect.height / 2)) * 8;
    const rotateY = (x / (rect.width / 2)) * 8;
    
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
      className={`transition-all duration-300 ease-out ${className}`}
      style={{
        transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovered ? 1.01 : 1})`,
        transformStyle: "preserve-3d",
      }}
    >
      <div style={{ transform: "translateZ(20px)" }} className="h-full">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#010408] text-zinc-100 font-sans">
      <ParticlesBackground />
      
      {/* Sci-Fi Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,191,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,191,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* 3D Glowing Background Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-gradient-radial from-sky-500/15 via-sky-600/5 to-transparent blur-3xl" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-cyan-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#010408]/70 border-b border-sky-500/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-sky-950/40 border border-sky-500/30 flex items-center justify-center relative overflow-hidden group-hover:border-sky-400 transition-colors">
              <svg viewBox="0 0 100 100" className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(0,191,255,0.8)]">
                <path d="M50 35 L40 58 L50 82 L60 58 Z" fill="#0c1724" stroke="#00bfff" strokeWidth="3" />
                <path d="M38 42 C20 30, 26 5, 41 12 C30 18, 30 35, 40 46" fill="#0c1724" stroke="#00bfff" strokeWidth="3" />
                <path d="M62 42 C80 30, 74 5, 59 12 C70 18, 70 35, 60 46" fill="#0c1724" stroke="#00bfff" strokeWidth="3" />
              </svg>
            </div>
            <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white to-sky-300 bg-clip-text text-transparent uppercase">
              SPORTS GOAT
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-sky-400 transition-colors">Features</a>
            <a href="#api" className="hover:text-sky-400 transition-colors">API</a>
            <a href="#docs" className="hover:text-sky-400 transition-colors">Docs</a>
            <a href="#pricing" className="hover:text-sky-400 transition-colors">Pricing</a>
            <Link href="/docs" className="hover:text-sky-400 transition-colors">Support</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-zinc-300 hover:text-white px-3 py-2 transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white px-4 py-2 rounded-lg shadow-lg shadow-sky-500/25 transition-all flex items-center gap-1.5"
            >
              Sign up <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Text Left */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/30 px-3.5 py-1 text-xs font-semibold text-sky-400 backdrop-blur">
            <Zap className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            <span className="uppercase tracking-widest text-[10px]">NEXT-GEN AUTHENTICATION</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
            Authentication <br />
            built for <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              everyone.
            </span>
          </h1>

          <p className="text-base text-zinc-400 leading-relaxed max-w-lg font-medium">
            Secure, scalable, and developer-friendly. Integrate powerful authentication in minutes with our APIs and SDKs.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/register"
              className="text-sm font-bold bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white px-6 py-3.5 rounded-xl shadow-xl shadow-sky-500/25 transition-all flex items-center gap-2"
            >
              Get started for free <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/docs"
              className="text-sm font-semibold bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-5 py-3.5 rounded-xl transition-colors flex items-center gap-2 backdrop-blur"
            >
              <FileText className="w-4 h-4 text-zinc-400" /> View documentation
            </Link>
          </div>

          {/* Badges under buttons */}
          <div className="flex items-center gap-6 pt-4 text-xs font-mono text-zinc-400 border-t border-zinc-800/40">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-sky-400" /> 99.99% Uptime</span>
            <span className="flex items-center gap-1.5"><span className="text-sky-400 font-bold text-sm">∞</span> Free forever</span>
            <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-sky-400" /> Open source</span>
          </div>
        </div>

        {/* Hero Right: 3D SPORTS GOAT Dashboard Preview */}
        <div className="lg:col-span-7 flex justify-center relative">
          <Card3D className="w-full">
            <div className="relative rounded-2xl border border-sky-500/30 bg-[#070d17]/90 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,191,255,0.15)] overflow-hidden">
              
              {/* Top Header of Preview */}
              <div className="h-12 bg-[#0a1322] border-b border-sky-500/20 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-sky-950 border border-sky-500/30 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 filter drop-shadow-[0_0_2px_rgba(0,191,255,0.8)]">
                      <path d="M50 35 L40 58 L50 82 L60 58 Z" fill="#0c1724" stroke="#00bfff" strokeWidth="4" />
                      <path d="M38 42 C20 30, 26 5, 41 12 C30 18, 30 35, 40 46" fill="#0c1724" stroke="#00bfff" strokeWidth="4" />
                      <path d="M62 42 C80 30, 74 5, 59 12 C70 18, 70 35, 60 46" fill="#0c1724" stroke="#00bfff" strokeWidth="4" />
                    </svg>
                  </div>
                  <span className="text-xs font-black tracking-wider text-white uppercase">SPORTS GOAT</span>
                </div>

                <div className="flex items-center gap-2 bg-sky-950/40 border border-sky-500/20 px-2.5 py-1 rounded-lg text-[11px] text-zinc-300">
                  <div className="w-4 h-4 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-[9px] font-bold text-sky-400">D</div>
                  <span>Developer</span>
                  <span className="text-[10px] text-zinc-500">admin@sportsgoat.dev</span>
                </div>
              </div>

              {/* Dashboard Layout Body */}
              <div className="flex min-h-[380px]">
                
                {/* Left Sidebar inside preview */}
                <div className="w-36 bg-[#040912] border-r border-sky-500/10 p-3 space-y-1.5 hidden sm:block">
                  <div className="bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-lg px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" /> Overview
                  </div>
                  <div className="text-zinc-400 hover:text-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Applications
                  </div>
                  <div className="text-zinc-400 hover:text-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-2">
                    <Key className="w-3.5 h-3.5" /> Keys
                  </div>
                  <div className="text-zinc-400 hover:text-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Users
                  </div>
                  <div className="text-zinc-400 hover:text-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Sessions
                  </div>
                  <div className="text-zinc-400 hover:text-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Logs
                  </div>
                </div>

                {/* Main Content inside preview */}
                <div className="flex-1 p-4 space-y-4 bg-[#060c17]/60">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Welcome back, Developer! 👋
                      </h3>
                      <p className="text-[10px] text-zinc-400">Here&apos;s what&apos;s happening with your projects.</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 px-2 py-0.5 rounded">
                      This month
                    </div>
                  </div>

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-sky-950/20 border border-sky-500/20 p-2.5 rounded-xl">
                      <p className="text-[9px] text-zinc-400 font-medium">Total Applications</p>
                      <p className="text-sm font-extrabold text-white">12</p>
                      <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">↑ 20%</p>
                    </div>
                    <div className="bg-sky-950/20 border border-sky-500/20 p-2.5 rounded-xl">
                      <p className="text-[9px] text-zinc-400 font-medium">Active Keys</p>
                      <p className="text-sm font-extrabold text-white">4,892</p>
                      <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">↑ 18%</p>
                    </div>
                    <div className="bg-sky-950/20 border border-sky-500/20 p-2.5 rounded-xl">
                      <p className="text-[9px] text-zinc-400 font-medium">Active Sessions</p>
                      <p className="text-sm font-extrabold text-white">1,250</p>
                      <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">↑ 24%</p>
                    </div>
                    <div className="bg-sky-950/20 border border-sky-500/20 p-2.5 rounded-xl">
                      <p className="text-[9px] text-zinc-400 font-medium">HWID Resets</p>
                      <p className="text-sm font-extrabold text-white">320</p>
                      <p className="text-[9px] text-red-400 font-semibold mt-0.5">↓ 12%</p>
                    </div>
                  </div>

                  {/* Bottom Split Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* Line Chart Preview */}
                    <div className="sm:col-span-7 bg-[#040812] border border-sky-500/15 p-3 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2">
                        <span className="font-bold text-zinc-200">Authentication activity</span>
                        <span className="text-[9px]">This week</span>
                      </div>
                      
                      {/* SVG Curved Glowing Chart Line */}
                      <div className="w-full h-24 relative flex items-end">
                        <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00bfff" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#00bfff" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,50 Q30,40 60,45 T120,20 T180,25 L200,10 L200,60 L0,60 Z"
                            fill="url(#chartGrad)"
                          />
                          <path
                            d="M0,50 Q30,40 60,45 T120,20 T180,25 L200,10"
                            fill="none"
                            stroke="#00bfff"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="200" cy="10" r="3.5" fill="#00bfff" className="animate-ping" />
                        </svg>
                      </div>
                      
                      <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                        <span>May 18</span><span>May 19</span><span>May 20</span><span>May 21</span><span>May 22</span><span>May 23</span><span>May 24</span>
                      </div>
                    </div>

                    {/* Applications List Preview */}
                    <div className="sm:col-span-5 bg-[#040812] border border-sky-500/15 p-3 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2">
                        <span className="font-bold text-zinc-200">Recent applications</span>
                        <span className="text-[9px] text-sky-400 cursor-pointer">View all</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] bg-sky-950/20 p-1.5 rounded border border-sky-500/10">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded bg-sky-500/20 flex items-center justify-center text-[9px] font-bold text-sky-400">S</div>
                            <div>
                              <p className="font-bold text-white leading-none">Sports Goat Loader</p>
                              <p className="text-[8px] text-zinc-500">v1.4.2</p>
                            </div>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                        </div>

                        <div className="flex items-center justify-between text-[10px] bg-sky-950/20 p-1.5 rounded border border-sky-500/10">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded bg-cyan-500/20 flex items-center justify-center text-[9px] font-bold text-cyan-400">X</div>
                            <div>
                              <p className="font-bold text-white leading-none">Xiter Free</p>
                              <p className="text-[8px] text-zinc-500">v0.9.1</p>
                            </div>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                        </div>

                        <div className="flex items-center justify-between text-[10px] bg-sky-950/20 p-1.5 rounded border border-sky-500/10">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400">P</div>
                            <div>
                              <p className="font-bold text-white leading-none">Premium Xiter</p>
                              <p className="text-[8px] text-zinc-500">v4.3.0</p>
                            </div>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          </Card3D>
        </div>

      </section>

      {/* Bottom Features Row (4 Cards matching Imagen 5) */}
      <section className="max-w-7xl mx-auto px-6 pb-24 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#050b14]/70 border border-sky-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-sky-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Enterprise-grade security</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Your data is protected with the highest standards and end-to-end encryption.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#050b14]/70 border border-sky-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-sky-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Blazing fast</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Global infrastructure built for performance and scale.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#050b14]/70 border border-sky-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-sky-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Developer first</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Beautiful APIs, SDKs, and docs that make integration simple.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#050b14]/70 border border-sky-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-sky-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Global infrastructure</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Low latency, high availability, anywhere in the world.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sky-500/10 bg-[#010408] py-8 text-center text-xs text-zinc-500 font-mono">
        <p>SPORTS GOAT &copy; {new Date().getFullYear()} — License Authentication Platform</p>
      </footer>

    </main>
  );
}
