"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "@/app/login/auth.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("You must agree to the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      // Send username as the main login identifier in the email field
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={styles.inputLabel}>Username</label>
        <div className={styles.fieldWrapper}>
          <input
            type="text"
            className={styles.premiumInput}
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={styles.inputLabel}>Email</label>
        <div className={styles.fieldWrapper}>
          <input
            type="email"
            className={styles.premiumInput}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={styles.inputLabel}>Password</label>
        <div className={styles.fieldWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            className={styles.premiumInput}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeBtn}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className={styles.inputLabel}>Confirm Password</label>
        <div className={styles.fieldWrapper}>
          <input
            type={showConfirm ? "text" : "password"}
            className={styles.premiumInput}
            placeholder="Confirm your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className={styles.eyeBtn}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.terms}>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className={styles.checkbox}
          />
          <span>I agree to the <Link href="/terms" className={styles.purpleLink}>Terms of Service</Link></span>
        </label>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.premiumBtn} disabled={loading}>
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
}
