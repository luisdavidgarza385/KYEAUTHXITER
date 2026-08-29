import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AssistantChat } from "@/components/AssistantChat";

export const metadata = {
  title: "Asistente Virtual — Spectral X",
  description: "Soporte interactivo de Spectral X para restablecer hardware ID (HWID).",
};

export default function AssistantPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("ka_assistant_session");

  if (!session) {
    redirect("/asistente/login");
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans p-3 sm:p-4" style={{ background: "radial-gradient(ellipse at 20% 50%, #060e28 0%, #020612 50%, #000408 100%)" }}>

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-sky-600/10 via-sky-900/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Bottom left glow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-radial from-blue-800/8 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Bottom right accent */}
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-gradient-radial from-sky-500/5 to-transparent blur-2xl pointer-events-none rounded-full animate-pulse" />

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] pointer-events-none opacity-20" />

      {/* Chat */}
      <div className="w-full flex justify-center z-10">
        <AssistantChat />
      </div>
    </main>
  );
}
