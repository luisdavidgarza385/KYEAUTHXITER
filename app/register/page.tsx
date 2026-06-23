import { RegisterForm } from "@/components/RegisterForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styles from "../login/auth.module.css";

export const metadata = { title: "Create Account — Spectral X" };

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <ParticlesBackground />
      <ThemeToggle />
      
      {/* Sci-Fi Grid overlay specific to register page */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none -z-0 opacity-60" />
      
      <div className={`${styles.box} premium-card-3d relative z-10`}>
        {/* Glow backdrop behind the register container */}
        <div className="absolute -inset-8 bg-gradient-to-tr from-purple-650/20 via-indigo-650/15 to-transparent blur-3xl rounded-full -z-10 animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />
        
        <div className={styles.brandIcon}>
          <ShieldCheck strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Create your account to get started</p>
        <div className={styles.card}>
          <RegisterForm />
        </div>
        <p className={styles.footer}>
          Already have an account?<Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
