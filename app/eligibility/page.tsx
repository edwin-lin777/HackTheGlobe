"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, ArrowRightIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Zap } from "lucide-react";
// ================================================================
// TOAST
// ================================================================
type ToastType = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastType[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        transform: "translateX(-50)",
        gap: 8,
        animation: "toastIn 0.25s ease",
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "all",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              t.type === "success"
                ? "#f0fdf4"
                : t.type === "error"
                  ? "#fef2f2"
                  : "#eff6ff",
            border: `1px solid ${t.type === "success" ? "#a7f3d0" : t.type === "error" ? "#fecaca" : "#bfdbfe"}`,
            color:
              t.type === "success"
                ? "#065f46"
                : t.type === "error"
                  ? "#ff4d4d"
                  : "#1e40af",
            borderRadius: 12,
            padding: "11px 16px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            minWidth: 260,
            maxWidth: 340,
            animation: "toastIn 1s ease",
          }}
        >
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.45,
              fontSize: 18,
              lineHeight: 1,
              padding: 0,
              color: "inherit",
            }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const counter = useRef(0);
  function toast(message: string, type: ToastType["type"] = "info") {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }
  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }
  return { toasts, toast, dismiss };
}

// ================================================================
// CLOUD MASCOT
// ================================================================
function CloudMascot({ isTypingPassword }: { isTypingPassword: boolean }) {
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setEyePos({
        x: (e.clientX / window.innerWidth - 0.5) * 6,
        y: (e.clientY / window.innerHeight - 0.5) * 3,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const eyeRy = isTypingPassword ? 1 : blink ? 2 : 11; // taller = more oval

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
    >
      <svg viewBox="0 0 150 84" width="150" height="84">
        <defs>
          <filter id="cs">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor="#94a3b8"
              floodOpacity="0.2"
            />
          </filter>
        </defs>

        {/* Cloud body */}
        <ellipse
          cx="75"
          cy="65"
          rx="62"
          ry="18"
          fill="#f1f5f9"
          filter="url(#cs)"
        />
        <circle cx="44" cy="50" r="20" fill="#f1f5f9" />
        <circle cx="75" cy="42" r="26" fill="#f1f5f9" />
        <circle cx="106" cy="50" r="18" fill="#f1f5f9" />

        {/* Left eye — rx wider than ry for oval */}
        <ellipse
          cx="62"
          cy="48"
          rx="9"
          ry={eyeRy}
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="1.5"
          style={{ transition: "ry 0.15s ease" }}
        />
        {!isTypingPassword && !blink && (
          <circle
            cx={62 + eyePos.x}
            cy={48 + eyePos.y}
            r="3.5"
            fill="#1e293b"
          />
        )}

        {/* Right eye */}
        <ellipse
          cx="90"
          cy="48"
          rx="9"
          ry={eyeRy}
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="1.5"
          style={{ transition: "ry 0.15s ease" }}
        />
        {!isTypingPassword && !blink && (
          <circle
            cx={90 + eyePos.x}
            cy={48 + eyePos.y}
            r="3.5"
            fill="#1e293b"
          />
        )}

        {/* Smile + cheeks */}
        <path
          d="M 60 68 Q 75 76 90 68"
          stroke="#94a3b8"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
// ================================================================
// STEP DOTS  (shadcn-style from reference)
// ================================================================
function StepDots({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 32,
      }}
    >
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Circle */}
            <div
              style={{
                position: "relative",
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                background:
                  i < current
                    ? "rgba(0,0,0,0.08)"
                    : i === current
                      ? "#111827"
                      : "rgba(0,0,0,0.04)",
                color:
                  i < current
                    ? "rgba(0,0,0,0.5)"
                    : i === current
                      ? "white"
                      : "rgba(0,0,0,0.25)",
                boxShadow:
                  i === current ? "0 0 0 4px rgba(17,24,39,0.08)" : "none",
                transition: "all 0.5s ease",
              }}
            >
              {i < current ? (
                <CheckIcon
                  size={14}
                  strokeWidth={2.5}
                  style={{ animation: "zoomIn 0.4s ease" }}
                />
              ) : (
                <span>{i + 1}</span>
              )}
              {/* pulse ring for current */}
              {i === current && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "rgba(17,24,39,0.15)",
                    filter: "blur(6px)",
                    animation: "pulse 2s infinite",
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: i <= current ? "#111827" : "#9ca3af",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              style={{
                position: "relative",
                width: 44,
                height: 2,
                marginBottom: 18,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(207,207,207,0.5)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(17,24,39,0.35)",
                  transformOrigin: "left",
                  transform: `scaleX(${i < current ? 1 : 0})`,
                  transition: "transform 0.6s ease",
                }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
      <style>{`
        @keyframes zoomIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:0.2; } }
      `}</style>
    </div>
  );
}

// ================================================================
// ELIGIBILITY QUESTIONS
// ================================================================
const QUESTIONS = [
  {
    key: "householdSize",
    label: "How many people live in your home?",
    hint: "Including yourself",
    type: "number",
  },
  {
    key: "annualIncome",
    label: "Approximate household income after tax ($/year)?",
    hint: "e.g. 35000",
    type: "number",
  },
  {
    key: "hasArrears",
    label: "Are you behind on your electricity or gas bill?",
    hint: null,
    type: "yesno",
  },
  {
    key: "isElectricHeat",
    label: "Is your home heated electrically?",
    hint: "Baseboard heaters, heat pump",
    type: "yesno",
  },
  {
    key: "isEnbridgeCustomer",
    label: "Do you have a natural gas bill from Enbridge?",
    hint: null,
    type: "yesno",
  },
  {
    key: "isNorthernOntario",
    label: "Do you live in Northern Ontario?",
    hint: "e.g. Sudbury, Thunder Bay",
    type: "yesno",
  },
  {
    key: "isOWSP",
    label: "Do you receive Ontario Works or ODSP?",
    hint: null,
    type: "yesno",
  },
] as const;

type AnswerKey = (typeof QUESTIONS)[number]["key"];
type Answers = Record<AnswerKey, string>;

// ================================================================
// MAIN PAGE
// ================================================================
export default function EligibilityPage() {
  const router = useRouter();
  const { toasts, toast, dismiss } = useToast();

  const [phase, setPhase] = useState<"account" | "eligibility">("account");
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    email: "",
    postalCode: "",
    password: "",
  });
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    householdSize: "",
    annualIncome: "",
    hasArrears: "",
    isElectricHeat: "",
    isEnbridgeCustomer: "",
    isNorthernOntario: "",
    isOWSP: "",
  });

  const currentQ = QUESTIONS[qIndex];
  const progressPct = ((qIndex + 1) / QUESTIONS.length) * 100;

  // ── Account submit ──
  function handleAccountSubmit() {
    if (!account.firstName.trim())
      return toast("Please enter your first name.", "error");
    if (!account.lastName.trim())
      return toast("Please enter your last name.", "error");
    if (!account.email.includes("@"))
      return toast("Please enter a valid email address.", "error");
    if (!/^[A-Za-z]\d[A-Za-z]/.test(account.postalCode.replace(/\s/, "")))
      return toast("Enter a valid Canadian postal code.", "error");
    if (account.password.length < 6)
      return toast("Password must be at least 6 characters.", "error");
    setAnswers((prev) => ({ ...prev, postalCode: account.postalCode }));
    toast("Account info saved — let's check your eligibility!", "success");
    setTimeout(() => setPhase("eligibility"), 350);
  }

  // ── Eligibility advance ──
  function handleNext() {
    const val = answers[currentQ.key as AnswerKey];
    if (!val.trim())
      return toast("Please answer this question to continue.", "error");
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    setSubmitting(true);
    toast("Checking your eligibility…", "info");
    const payload = {
      postalCode: answers.postalCode || account.postalCode,
      householdSize: parseInt(answers.householdSize) || 1,
      annualIncome: parseInt(answers.annualIncome) || 0,
      hasArrears: answers.hasArrears === "yes",
      isElectricHeat: answers.isElectricHeat === "yes",
      isEnbridgeCustomer: answers.isEnbridgeCustomer === "yes",
      isNorthernOntario: answers.isNorthernOntario === "yes",
      isOWSP: answers.isOWSP === "yes",
      monthlyKwh: 700,
    };
    try {
      const res = await fetch("/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      sessionStorage.setItem("eligibilityResult", JSON.stringify(data));
      toast("Results ready!", "success");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch {
      toast("Something went wrong. Please try again.", "error");
      setSubmitting(false);
    }
  }

  sessionStorage.setItem(
    "userInfo",
    JSON.stringify({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      postalCode: account.postalCode,
      householdSize: parseInt(answers.householdSize) || 1,
      annualIncome: parseInt(answers.annualIncome) || 0,
    }),
  );

  // ── Shared input style ──
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 48,
    padding: "0 14px",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
    background: "rgba(255,255,255,0.5)",
    backdropFilter: "blur(8px)",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #fafafa 55%, #fdf4ff 100%)",
        display: "flex",

        flexDirection: "column",

        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-color: rgba(0,0,0,0.3) !important; box-shadow: 0 0 0 3px rgba(17,24,39,0.06) !important; }
        input::placeholder { color: #9ca3af; }
      `}</style>
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
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

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ width: "100%", maxWidth: 380 }}>
            {/* Step dots */}
            <StepDots
              steps={["Your info", "Eligibility"]}
              current={phase === "account" ? 0 : 1}
            />

            {/* Card */}
            <div
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow:
                  "0 20px 60px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
                padding: "28px 28px 24px",
                overflow: "hidden",
              }}
            >
              {/* ═══ PHASE 1: ACCOUNT ═══ */}
              {phase === "account" && (
                <div style={{ animation: "fadeUp 0.4s ease" }}>
                  <CloudMascot isTypingPassword={isTypingPassword} />

                  <div style={{ textAlign: "center", marginBottom: 22 }}>
                    <h2
                      style={{
                        fontSize: 19,
                        fontWeight: 800,
                        color: "#111827",
                        margin: "0 0 4px",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      Create your account
                    </h2>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                      We'll save your results for you
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 11,
                    }}
                  >
                    {/* Name row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      {(
                        [
                          ["firstName", "First name", "Jane"],
                          ["lastName", "Last name", "Doe"],
                        ] as const
                      ).map(([key, label, ph]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#374151",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {label}
                          </label>
                          <input
                            style={inputStyle}
                            placeholder={ph}
                            value={account[key]}
                            onChange={(e) =>
                              setAccount((a) => ({
                                ...a,
                                [key]: e.target.value,
                              }))
                            }
                            autoFocus={key === "firstName"}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Email */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#374151",
                          letterSpacing: "0.02em",
                        }}
                      >
                        Email
                      </label>
                      <input
                        style={inputStyle}
                        type="email"
                        placeholder="jane@example.com"
                        value={account.email}
                        onChange={(e) =>
                          setAccount((a) => ({ ...a, email: e.target.value }))
                        }
                      />
                    </div>

                    {/* Postal */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#374151",
                          letterSpacing: "0.02em",
                        }}
                      >
                        Postal code
                      </label>
                      <input
                        style={inputStyle}
                        placeholder="M5V 2T6"
                        value={account.postalCode}
                        onChange={(e) =>
                          setAccount((a) => ({
                            ...a,
                            postalCode: e.target.value.toUpperCase(),
                          }))
                        }
                      />
                    </div>

                    {/* Password */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
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
                        placeholder="Min. 6 characters"
                        value={account.password}
                        onChange={(e) =>
                          setAccount((a) => ({
                            ...a,
                            password: e.target.value,
                          }))
                        }
                        onFocus={() => setIsTypingPassword(true)}
                        onBlur={() => setIsTypingPassword(false)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAccountSubmit()
                        }
                      />
                    </div>

                    <button
                      onClick={handleAccountSubmit}
                      style={{
                        marginTop: 4,
                        width: "100%",
                        height: 48,
                        background: "#111827",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontFamily: "inherit",
                        boxShadow: "0 8px 24px rgba(17,24,39,0.2)",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.88")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      Continue{" "}
                      <ArrowRightIcon
                        size={14}
                        strokeWidth={2}
                        style={{ transition: "transform 0.2s" }}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ PHASE 2: ELIGIBILITY (one question at a time) ═══ */}
              {phase === "eligibility" && (
                <div key={qIndex} style={{ animation: "fadeUp 0.35s ease" }}>
                  {/* Progress bar */}
                  <div
                    style={{
                      height: 2,
                      background: "rgba(0,0,0,0.06)",
                      borderRadius: 99,
                      overflow: "hidden",
                      marginBottom: 28,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 99,
                        background:
                          "linear-gradient(90deg, #111827 0%, #374151 100%)",
                        width: `${progressPct}%`,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    {/* Question label + counter */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#111827",
                          lineHeight: 1.45,
                          flex: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {currentQ.label}
                      </label>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "rgba(0,0,0,0.3)",
                          flexShrink: 0,
                          marginLeft: 10,
                          marginTop: 2,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {qIndex + 1}/{QUESTIONS.length}
                      </span>
                    </div>
                    {currentQ.hint && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          margin: "0 0 14px",
                        }}
                      >
                        {currentQ.hint}
                      </p>
                    )}

                    {/* Text/number input */}
                    {(currentQ.type === "text" ||
                      currentQ.type === "number") && (
                      <input
                        key={currentQ.key}
                        type={currentQ.type}
                        autoFocus
                        style={{ ...inputStyle, height: 52, fontSize: 15 }}
                        placeholder={currentQ.hint ?? ""}
                        value={answers[currentQ.key as AnswerKey]}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQ.key]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                      />
                    )}

                    {/* Yes/No */}
                    {currentQ.type === "yesno" && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 10,
                          marginTop: 6,
                        }}
                      >
                        {(["yes", "no"] as const).map((opt) => {
                          const sel =
                            answers[currentQ.key as AnswerKey] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [currentQ.key]: opt,
                                }))
                              }
                              style={{
                                height: 52,
                                borderRadius: 10,
                                border: `1.5px solid ${sel ? "#111827" : "rgba(0,0,0,0.1)"}`,
                                background: sel
                                  ? "#111827"
                                  : "rgba(255,255,255,0.5)",
                                color: sel ? "white" : "#374151",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all 0.18s ease",
                                backdropFilter: "blur(8px)",
                              }}
                            >
                              {opt === "yes" ? "Yes" : "No"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <button
                      onClick={handleNext}
                      disabled={submitting}
                      style={{
                        width: "100%",
                        height: 48,
                        background: "#111827",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: submitting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontFamily: "inherit",
                        boxShadow: "0 8px 24px rgba(17,24,39,0.18)",
                        opacity: submitting ? 0.6 : 1,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        !submitting && (e.currentTarget.style.opacity = "0.85")
                      }
                      onMouseLeave={(e) =>
                        !submitting && (e.currentTarget.style.opacity = "1")
                      }
                    >
                      {submitting
                        ? "Checking…"
                        : qIndex < QUESTIONS.length - 1
                          ? "Continue"
                          : "See my results"}
                      {!submitting && (
                        <ArrowRightIcon size={14} strokeWidth={2} />
                      )}
                    </button>

                    {qIndex > 0 && (
                      <button
                        onClick={() => setQIndex((i) => i - 1)}
                        style={{
                          width: "100%",
                          height: 36,
                          background: "none",
                          border: "none",
                          color: "rgba(0,0,0,0.35)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          fontFamily: "inherit",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#111827")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "rgba(0,0,0,0.35)")
                        }
                      >
                        <ChevronLeft size={13} /> Go back
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer note */}
            <p
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "#9ca3af",
                marginTop: 16,
              }}
            >
              Free · No credit check · Takes ~3 minutes
            </p>
          </div>

          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </div>
      </div>
    </div>
  );
}
