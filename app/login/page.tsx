import { LoginForm } from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styles from "./auth.module.css";

export const metadata = { title: "Iniciar Sesión — Spectral X" };

const ERR_MESSAGES: Record<string, string> = {
  discord_not_configured: "Discord login is not configured.",
  google_not_configured: "Google login is not configured.",
  apple_not_configured: "Apple login is not configured.",
  no_account: "No account found for this email.",
  invalid_state: "OAuth state mismatch. Please try again.",
  missing_code: "OAuth provider did not return a code.",
  token_exchange: "Failed to exchange OAuth code.",
  fetch_profile: "Failed to fetch your profile from the OAuth provider.",
  telegram_invalid: "Telegram login data is invalid or expired.",
  access_denied: "You declined the OAuth authorization.",
};

export default function LoginPage({ searchParams }: { searchParams: { err?: string } }) {
  const errMsg = searchParams.err ? ERR_MESSAGES[searchParams.err] || `OAuth error: ${searchParams.err}` : null;
  return (
    <div className={styles.page}>
      <ParticlesBackground />
      <ThemeToggle />
      
      {/* Sci-Fi Grid overlay specific to login page */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none -z-0 opacity-60" />
      
      <div className={`${styles.box} premium-card-3d relative z-10`}>
        {/* Glow backdrop behind the login container */}
        <div className="absolute -inset-8 bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-transparent blur-3xl rounded-full -z-10 animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />
        
        <div className={styles.brandIcon}>
          <ShieldCheck strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to access your account</p>
        <div className={styles.card}>
          {errMsg && <div className={styles.error}>{errMsg}</div>}
          <LoginForm />
        </div>
        <p className={styles.footer}>
          Don&apos;t have an account?<Link href="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
