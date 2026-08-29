import Link from "next/link";
import { ShieldCheck, ArrowLeft, FileText, Lock, CheckCircle } from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export const metadata = {
  title: "Términos de Servicio — SecureX Auth",
};

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" /> Términos Oficiales
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Términos de Servicio</h1>
          <p className="text-xs text-zinc-400 font-mono">Última actualización: 25 de Julio de 2026</p>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <div className="bg-[#050d1a]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" /> 1. Aceptación de los Términos
            </h2>
            <p className="text-xs text-zinc-400">
              Al registrarte y hacer uso de los servicios de <strong className="text-white">SecureX Auth</strong>, aceptas cumplir y estar sujeto a los presentes Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra plataforma.
            </p>
          </div>

          <div className="bg-[#050d1a]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" /> 2. Uso Autorizado y Restricciones
            </h2>
            <p className="text-xs text-zinc-400">
              SecureX Auth proporciona herramientas de gestión de licencias, autenticación HWID y compilación de loaders. Queda estrictamente prohibido utilizar la plataforma para:
            </p>
            <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
              <li>Distribución de malware, ransomware o software dañino.</li>
              <li>Intentos de vulnerar o sobrecargar los servidores de la infraestructura.</li>
              <li>Revender cuentas o acceso a la plataforma sin autorización expresa.</li>
            </ul>
          </div>

          <div className="bg-[#050d1a]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-sky-400" /> 3. Planes, Créditos y Suscripciones
            </h2>
            <p className="text-xs text-zinc-400">
              Los planes Gratuito, VIP ($1.99/mes) e Ilimitado ($7.99/año) otorgan cuotas específicas de licencias y características de acuerdo con la descripción de cada plan. Las suscripciones activadas se renuevan o vencen según el período adquirido.
            </p>
          </div>

          <div className="bg-[#050d1a]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" /> 4. Cancelaciones y Soporte
            </h2>
            <p className="text-xs text-zinc-400">
              Para cualquier consulta o solicitud de cancelación, puedes contactar con el soporte a través del Asistente Virtual o directamente desde tu panel de usuario.
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
