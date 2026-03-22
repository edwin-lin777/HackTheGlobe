"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Building2 } from "lucide-react";

export default function B2BLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    // hardcoded for demo — swap for real auth later
    if (email && password) {
      router.push("/b2b/dashboard");
    }
  }

  const inputStyle = {
    width: "100%",
    height: 46,
    padding: "0 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
    background: "white",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 24px 0" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={13} color="white" fill="white" />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            SubsidyAccess
          </span>
        </Link>
      </div>

      {/* Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#f0fdf4",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Building2 size={20} color="#059669" />
            </div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 4px",
                letterSpacing: "-0.03em",
              }}
            >
              Housing provider login
            </h1>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Access your tenant energy support dashboard
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              padding: "24px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#374151",
                    letterSpacing: "0.02em",
                  }}
                >
                  Work email
                </label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="you@torontohousing.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#374151",
                    letterSpacing: "0.02em",
                  }}
                >
                  Password
                </label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <button
                onClick={handleLogin}
                style={{
                  marginTop: 4,
                  width: "100%",
                  height: 46,
                  background: "#111827",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 4px 16px rgba(17,24,39,0.18)",
                }}
              >
                Sign in →
              </button>
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "#9ca3af",
              marginTop: 14,
            }}
          >
            Are you a tenant?{" "}
            <Link
              href="/eligibility"
              style={{
                color: "#1d4ed8",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Check your eligibility instead →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
