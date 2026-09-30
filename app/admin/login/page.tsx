"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import Link from "next/link";

export default function AdminLoginPage() {
  const { loginAdmin, isAdmin } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blockedSeconds, setBlockedSeconds] = useState<number | null>(null);

  // Countdown timer if blocked
  useEffect(() => {
    if (!blockedSeconds || blockedSeconds <= 0) return;
    const timer = setInterval(() => {
      setBlockedSeconds((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          setError("");
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [blockedSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockedSeconds && blockedSeconds > 0) return;

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    const res = await loginAdmin(username.trim(), password);
    setLoading(false);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Gagal masuk.");
      if (typeof res.remainingAttempts === "number") {
        setRemainingAttempts(res.remainingAttempts);
      }
      if (res.blockedRemainingSeconds && res.blockedRemainingSeconds > 0) {
        setBlockedSeconds(res.blockedRemainingSeconds);
        setRemainingAttempts(0);
      }
    }
  };

  const isBlocked = Boolean(blockedSeconds && blockedSeconds > 0);
  const minutesLeft = blockedSeconds ? Math.floor(blockedSeconds / 60) : 0;
  const secondsLeft = blockedSeconds ? blockedSeconds % 60 : 0;

  return (
    <div className="auth-wrap">
      <div className="card-form">
        <h2>
          <i>
            <i className="fa-solid fa-lock" />
          </i>
          Admin Login
        </h2>
        <p className="sub">
          Akses khusus administrator {config.websiteName}. Masuk dengan username dan password terdaftar.
        </p>

        {error && <div className="form-error">{error}</div>}

        {isBlocked && (
          <div
            style={{
              background: "var(--red)",
              color: "#FFF",
              border: "var(--border-w-sm) solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 14px",
              marginBottom: "16px",
              boxShadow: "var(--shadow-sm)",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 6 }} />
            Sistem terkunci sementara. Silakan coba lagi dalam:{" "}
            <strong>
              {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
            </strong>
          </div>
        )}

        {typeof remainingAttempts === "number" && remainingAttempts > 0 && remainingAttempts < 5 && (
          <div
            style={{
              background: "var(--yellow)",
              color: "#000",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 12px",
              marginBottom: "14px",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
            Percobaan login tersisa: {remainingAttempts} dari {config.security.maxLoginAttempts} kali
          </div>
        )}

        {isAdmin ? (
          <div>
            <div
              style={{
                background: "var(--green)",
                border: "var(--border-w-sm) solid var(--border)",
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-sm)",
                marginBottom: "20px",
                fontWeight: 700,
              }}
            >
              <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
              Kamu sudah login sebagai Administrator.
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/dashboard" className="btn btn-primary btn-block">
                <i className="fa-solid fa-gauge" /> Ke Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isBlocked || loading}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBlocked || loading}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || isBlocked}
              className="btn btn-primary btn-block"
              style={{ marginTop: 10 }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" /> Memverifikasi...
                </>
              ) : isBlocked ? (
                <>
                  <i className="fa-solid fa-ban" /> Terkunci Sementara
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket" /> Masuk
                </>
              )}
            </button>

            <div className="form-hint" style={{ marginTop: 16 }}>
              <Link href="/">Kembali ke Beranda</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
