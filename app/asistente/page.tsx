import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AssistantChat } from "@/components/AssistantChat";
import { ParticlesBackground } from "@/components/ParticlesBackground";

export const metadata = {
  title: "Asistente Virtual — Spectral X",
  description: "Soporte interactivo de Spectral X para restablecer hardware ID (HWID).",
};

export default function AssistantPage() {
  // 1. Verify session on server side
  const cookieStore = cookies();
  const session = cookieStore.get("ka_assistant_session");

  if (!session) {
    redirect("/asistente/login");
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-[#020503] text-zinc-150 overflow-hidden font-sans p-4">
      {/* Dynamic particles background */}
      <ParticlesBackground />

      {/* Cybergrid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none opacity-60" />

      {/* Ambient lighting spots */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full bg-gradient-radial from-emerald-600/10 via-teal-650/4 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-emerald-500/5 to-transparent blur-3xl animate-pulse" />
      </div>

      {/* Embedded Chat Client Wrapper */}
      <div className="w-full flex justify-center z-10 animate-fade-in-up">
        <AssistantChat />
      </div>
    </main>
  );
}
