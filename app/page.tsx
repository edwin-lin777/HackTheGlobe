"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Home,
  Wallet,
  Building,
} from "lucide-react";

const PROGRAMS = [
  {
    id: "oesp",
    label: "OESP",
    sub: "$35–$113/mo",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    logo: "/osep.jpg",
  },
  {
    id: "leap",
    label: "LEAP",
    sub: "Up to $780",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    logo: "/download.png",
  },
  {
    id: "eap",
    label: "EAP",
    sub: "Free upgrades",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#a7f3d0",
    logo: "https://www.google.com/s2/favicons?domain=saveonenergy.ca&sz=32",
  },
  {
    id: "enbridge",
    label: "Winterproofing",
    sub: "Free upgrades",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    logo: "https://www.google.com/s2/favicons?domain=enbridgegas.com&sz=32",
  },
  {
    id: "noec",
    label: "NOEC",
    sub: "Tax credit",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    logo: "https://www.google.com/s2/favicons?domain=ontario.ca&sz=32",
  },
  {
    id: "homereno",
    label: "Home Reno",
    sub: "Rebates",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    logo: "https://www.google.com/s2/favicons?domain=ontario.ca&sz=32",
  },
];

function ProgramMarquee() {
  const items = [...PROGRAMS, ...PROGRAMS, ...PROGRAMS];
  return (
    <div
      style={{ overflow: "hidden", position: "relative", padding: "4px 0 8px" }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(to right, #f8fafc, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(to left, #f8fafc, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: 10, width: "max-content" }}
      >
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "white",
              border: `1px solid ${p.border}`,
              borderRadius: 12,
              padding: "9px 14px",
              minWidth: 170,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: p.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              <img
                src={p.logo}
                width={16}
                height={16}
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 1px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {p.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: p.color,
                  fontWeight: 600,
                }}
              >
                {p.sub}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #f3f4f6",
          padding: "0 28px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src="/logo.png"
            alt="Navi$"
            style={{ height: 32, width: "auto" }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            Navi$
          </span>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>
          Energy supports in Ontario
        </span>
      </nav>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "840px" }}>
          {/* Two-column hero */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
              gap: "32px",
              marginBottom: "40px",
            }}
          >
            {/* Left */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: "30px",
                  lineHeight: 1.03,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.04em",
                  margin: "0 0 10px 0",
                }}
              >
                Find the energy programs you qualify for in minutes.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: 1.7,
                  margin: "0 0 18px 0",
                }}
              >
                Answer a few quick questions and see supports like OESP, LEAP,
                and free home upgrades – personalized to your household.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <button
                  type="button"
                  className="border border-[#e5e7eb] "
                  onClick={() => router.push("/eligibility")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "11px 18px",
                    borderRadius: "10px",
                    border: "border-black",
                    background: "white",
                    color: "black",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Start eligibility check <ArrowRight size={14} />
                </button>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ShieldCheck size={14} color="#16a34a" />
                  Free, no credit check, no cost.
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                style={{ display: "flex", gap: 8, marginBottom: 18 }}
              >
                <button
                  onClick={() => router.push("/eligibility")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="/home.png"
                      width={16}
                      height={16}
                      alt=""
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  I'm a resident
                </button>

                <button
                  onClick={() => router.push("/b2b/login")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: "#f0fdf4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="/building.png"
                      width={16}
                      height={16}
                      alt=""
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  I'm a housing provider
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              ></motion.div>
            </div>

            {/* Right — card preview */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                padding: "18px 18px 16px",
                boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#9ca3af",
                      margin: "0 0 4px 0",
                      fontWeight: 700,
                    }}
                  >
                    Example result
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#111827",
                      margin: 0,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Family in Toronto, 3 people
                  </p>
                </div>
                <div
                  style={{
                    background: "#eff6ff",
                    borderRadius: "999px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    color: "#1d4ed8",
                    fontWeight: 600,
                  }}
                >
                  4 programs matched
                </div>
              </div>

              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 11px",
                  borderRadius: "12px",
                  background: "#f9fafb",
                  border: "1px dashed #e5e7eb",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: "0 0 4px 0",
                    fontWeight: 700,
                  }}
                >
                  Estimated support
                </p>
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    color: "#111827",
                    margin: 0,
                    letterSpacing: "-0.04em",
                  }}
                >
                  $1,190{" "}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 400,
                      color: "#6b7280",
                    }}
                  >
                    per year
                  </span>
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#059669",
                    margin: "4px 0 0 0",
                    fontWeight: 600,
                  }}
                >
                  Covers ~85% of electricity bill
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                {[
                  {
                    name: "Ontario Electricity Support Program",
                    short: "OESP",
                    value: "$45/mo credit",
                    color: "#2563eb",
                  },
                  {
                    name: "Low-income Energy Assistance Program",
                    short: "LEAP",
                    value: "Up to $650",
                    color: "#dc2626",
                  },
                  {
                    name: "Energy Affordability Program",
                    short: "EAP",
                    value: "Free upgrades",
                    color: "#059669",
                  },
                ].map((p) => (
                  <div
                    key={p.short}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 9px",
                      borderRadius: "10px",
                      background: "#f9fafb",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {p.name}
                      </span>
                      <span style={{ fontSize: "10px", color: "#6b7280" }}>
                        {p.short}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: p.color,
                      }}
                    >
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: "10px",
                  color: "#9ca3af",
                  margin: "4px 0 0 0",
                }}
              >
                Results are examples. Your actual programs will depend on your
                answers.
              </p>
            </motion.div>
          </div>

          {/* PROGRAMS MARQUEE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 10px 0",
              }}
            >
              Programs we check for you
            </p>
            <ProgramMarquee />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
