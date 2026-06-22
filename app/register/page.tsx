import { RegisterForm } from "@/components/RegisterForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styles from "../login/auth.module.css";

export const metadata = { title: "Create Account — Dark Hacks" };

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <ThemeToggle />
      <div className={styles.box}>
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
