import Link from "next/link";
import { Shield, ArrowLeft, Lock, Database, Eye } from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export const metadata = {
  title: "Política de Privacidad — SecureX Auth",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen relative bg-[#010408] text-zinc-100 font-sans p-6 md:p-12">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,191,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,191,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-60" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header navigation */}
        <Link href="/register" className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a Registro
        </Link>

        {/* Title */}
        <div className="space-y-3 border-b border-sky-500/20 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/40 border border-sky-500/30 text-xs font-bold text-sky-400">
            <Lock className="w-3.5 h-3.5" /> Privacidad Garantizada
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Política de Privacidad</h1>
          <p className="text-xs text-zinc-400 font-mono">Última actualización: 25 de Julio de 2026</p>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <div className="bg-[#050d1a]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" /> 1. Información que Recopilamos
            </h2>
            <p className="text-xs text-zinc-400">
              En <strong className="text-white">SecureX Auth</strong> nos tomamos muy en serio la privacidad. Únicamente recopilamos los datos estrictamente necesarios para el funcionamiento del servicio:
            </p>
            <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
              <li>Nombre de usuario y correo electrónico de la cuenta.</li>
              <li>Hashes de contraseña protegidos criptográficamente (bcrypt).</li>
              <li>Identificadores HWID anonimizados para la verificación de licencias.</li>
            </ul>
          </div>

          <div className="bg-[#050d1a]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" /> 2. Protección y Encriptación de Datos
            </h2>
            <p className="text-xs text-zinc-400">
              Toda la comunicación entre tu aplicación y nuestros servidores viaja cifrada mediante HTTPS/TLS de 256 bits. Las sesiones están protegidas con firmas HMAC SHA-256 para evitar cualquier manipulación externa.
            </p>
          </div>

          <div className="bg-[#050d1a]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" /> 3. No Compartimos tus Datos
            </h2>
            <p className="text-xs text-zinc-400">
              Jamás vendemos, alquilamos ni compartimos la información de nuestros usuarios con terceros. Tu base de datos de licencias y usuarios es privada y de tu propiedad exclusiva.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-sky-500/10 text-center text-xs text-zinc-500 font-mono">
          SecureX Auth &copy; {new Date().getFullYear()} — Plataforma de Autenticación de Licencias
        </div>
      </div>
    </main>
  );
}
