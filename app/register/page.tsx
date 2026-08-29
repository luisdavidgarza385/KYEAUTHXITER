import { RealAuthXView } from "@/components/RealAuthXView";

export const metadata = {
  title: "SecureX Auth — Crear Cuenta | Secure Access",
  description: "Crea tu cuenta de autenticación y licencias en SecureX Auth",
};

export default function RegisterPage({ searchParams }: { searchParams?: { err?: string } }) {
  return <RealAuthXView initialMode="register" searchParams={searchParams} />;
}
