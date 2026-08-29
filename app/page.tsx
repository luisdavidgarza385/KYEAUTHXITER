import { RealAuthXView } from "@/components/RealAuthXView";

export const metadata = {
  title: "SecureX Auth — Iniciar Sesión | Secure Access",
  description: "Accede a tu panel de control de autenticación y licencias en SecureX Auth",
};

export default function HomePage({ searchParams }: { searchParams: { err?: string } }) {
  return <RealAuthXView initialMode="login" searchParams={searchParams} />;
}
