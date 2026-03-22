"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Phone,
  ExternalLink,
  Bell,
  X,
  Zap,
  MapPin,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Lock,
  AlertTriangle,
} from "lucide-react";

// ================================================================
// TYPES
// ================================================================
type Status = "not_started" | "in_progress" | "submitted";

type Program = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  description: string;
  applyUrl: string | null;
  annualSaving: number | null;
  monthlyCredit: number | null;
  status: Status;
  howToApply: string;
  documents: string[];
};

type DashboardData = {
  programs: Program[];
  billImpact: {
    ldcName: string;
    monthlyBill: number;
    annualBill: number;
    totalAnnualSaving: number;
    savingPercentage: number;
  };
  agency: {
    name: string;
    phone: string;
    hours: string;
    onlinePortal: string;
    note: string;
  };
  alerts: { id: string; title: string; message: string }[];
};

// ================================================================
// DUMMY DATA
// ================================================================
const DUMMY: DashboardData = {
  programs: [
    {
      id: "oesp",
      name: "Ontario Electricity Support Program",
      shortName: "OESP",
      type: "ongoing",
      description:
        "The Ontario Electricity Support Program provides $35–$75+ in monthly bill credits to eligible low-income households, based on income and household size, for up to 2 years.",
      applyUrl: "https://ontarioelectricitysupport.ca",
      annualSaving: 540,
      monthlyCredit: 45,
      status: "not_started",
      howToApply: "",
      documents: [
        "Electricity bill (account number)",
        "SIN for all household members 18+",
        "Names and birthdates of everyone in the home",
      ],
    },
    {
      id: "leap",
      name: "Low-income Energy Assistance Program",
      shortName: "LEAP",
      type: "emergency",
      description:
        "The Low-income Energy Assistance Program provides a one-time emergency payment to help low-income households cover overdue electricity or natural gas bills and avoid disconnection.",
      applyUrl: null,
      annualSaving: 650,
      monthlyCredit: null,
      status: "not_started",
      howToApply: "",
      documents: [
        "Most recent bill showing amount owing",
        "Proof of income",
        "Government-issued ID",
        "Proof of address",
      ],
    },
    {
      id: "eap",
      name: "Energy Affordability Program",
      shortName: "EAP",
      type: "retrofit",
      description:
        "The Energy Affordability Program provides free energy-saving upgrades to eligible low-income households. Auto-qualifies with OESP.",
      applyUrl: "https://saveonenergy.ca",
      annualSaving: null,
      monthlyCredit: null,
      status: "not_started",
      howToApply:
        "Apply at SaveOnEnergy.ca. You automatically qualify because you are eligible for OESP.",
      documents: ["Proof of OESP enrollment"],
    },
    {
      id: "enbridge_winterproofing",
      name: "Enbridge Home Winterproofing",
      shortName: "Winterproofing",
      type: "retrofit",
      description:
        "Free home upgrades like insulation and draft proofing to help low-income households stay warm and reduce natural gas heating costs.",
      applyUrl: "https://www.enbridgegas.com/home-winterproofing",
      annualSaving: null,
      monthlyCredit: null,
      status: "not_started",
      howToApply: "Apply at enbridgegas.com/home-winterproofing.",
      documents: ["Enbridge Gas account number", "Proof of income"],
    },
  ],
  billImpact: {
    ldcName: "Toronto Hydro-Electric System Limited",
    monthlyBill: 117.29,
    annualBill: 1407.48,
    totalAnnualSaving: 1190,
    savingPercentage: 85,
  },
  agency: {
    name: "Toronto Hydro LEAP Intake",
    phone: "211",
    hours: "Mon–Fri 9:00AM–5:00PM",
    onlinePortal:
      "https://www.toronto.ca/community-people/employment-social-support/",
    note: "Call 211 and ask for your nearest LEAP intake agency. They will book a phone or in-person interview.",
  },
  alerts: [
    {
      id: "a1",
      title: "OESP thresholds increased",
      message:
        "Ontario raised OESP eligibility thresholds by 35% in 2024. You may qualify for a higher credit.",
    },
    {
      id: "a2",
      title: "LEAP application pending",
      message:
        "You qualify for up to $650 in emergency assistance. Contact your agency to start.",
    },
  ],
};

// ================================================================
// CONFIGS
// ================================================================
const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  ongoing:   { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  emergency: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  retrofit:  { color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
  rebate:    { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
};

const STATUS_CONFIG: Record<Status, { color: string; bg: string; label: string }> = {
  not_started: { color: "#6b7280", bg: "#f3f4f6", label: "Not started" },
  in_progress: { color: "#d97706", bg: "#fef3c7", label: "In progress" },
  submitted:   { color: "#059669", bg: "#d1fae5", label: "Submitted" },
};

// ================================================================
// APPLICATION GUIDE STEPS
// ================================================================
const GUIDE_STEPS = [
  {
    order: 1,
    programId: "oesp",
    program: "OESP",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    time: "15 min",
    how: "Online",
    urgent: false,
    why: "Apply first — EAP automatically unlocks once OESP is approved.",
    steps: [
      "Go to ontarioelectricitysupport.ca",
      "Click 'Apply Now' and create an account",
      "Enter your electricity account number (found on your bill, top right)",
      "Upload proof of income — NOA from CRA or your OW/ODSP letter",
      "Submit. Approval takes 2–4 weeks. Credit appears on your next bill.",
    ],
    docs: [
      "Electricity bill (account number)",
      "Proof of income (NOA or OW/ODSP letter)",
      "Government-issued ID",
    ],
    link: "https://ontarioelectricitysupport.ca",
  },
  {
    order: 2,
    programId: "leap",
    program: "LEAP",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    time: "30 min",
    how: "Phone / In-person",
    urgent: true,
    why: "Apply before your next bill due date — LEAP can cover arrears and prevent disconnection.",
    steps: [
      "Call your local LEAP intake agency (number shown in your results)",
      "Tell them you have arrears and need emergency bill assistance",
      "They will schedule an intake appointment — usually within 1–2 weeks",
      "Bring your documents to the appointment",
      "Grant of up to $650 is paid directly to your utility.",
    ],
    docs: [
      "Utility bill showing amount owing",
      "Proof of income",
      "Government-issued ID",
      "Proof of address",
    ],
    link: null,
  },
  {
    order: 3,
    programId: "eap",
    program: "EAP",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#a7f3d0",
    time: "Automatic",
    how: "No application",
    urgent: false,
    why: "Once OESP approves you, EAP enrollment is automatic — no separate application needed.",
    steps: [
      "Wait for your OESP approval letter (email or mail)",
      "SaveOnEnergy will contact you directly to schedule a free home assessment",
      "A technician visits and installs upgrades at no cost",
      "Upgrades may include smart thermostat, LED bulbs, efficient showerhead, and more",
    ],
    docs: ["Nothing extra — OESP approval triggers this automatically"],
    link: "https://saveonenergy.ca",
  },
  {
    order: 4,
    programId: "enbridge_winterproofing",
    program: "Enbridge Winterproofing",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    time: "20 min",
    how: "Online",
    urgent: false,
    why: "Free insulation and draft proofing — reduces your gas bill permanently.",
    steps: [
      "Go to enbridgegas.com and search 'Home Winterproofing Program'",
      "Enter your Enbridge account number to confirm eligibility",
      "Book a free home energy assessment",
      "An Enbridge contractor completes the work — you pay nothing",
    ],
    docs: [
      "Enbridge gas bill (account number)",
      "Proof of income",
    ],
    link: "https://enbridgegas.com/home-winterproofing",
  },
];

// ================================================================
// APPLICATION GUIDE COMPONENT
// ================================================================
function ApplicationGuide({ programs }: { programs: Program[] }) {
  const [openStep, setOpenStep] = useState<number | null>(0);

  const qualifiedIds = programs.map(p => p.id);
  const steps = GUIDE_STEPS.filter(s => qualifiedIds.includes(s.programId));

  if (steps.length === 0) return null;

  return (
    <div style={{ marginTop: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
            How to apply — step by step
          </h2>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
            Apply in this order to maximize your benefits. OESP must come first.
          </p>
        </div>
        <div style={{
          background: "#f0fdf4", border: "1px solid #a7f3d0",
          borderRadius: 99, padding: "3px 10px",
          fontSize: 11, color: "#059669", fontWeight: 700,
          display: "flex", alignItems: "center", gap: 5,
          flexShrink: 0,
        }}>
          <CheckCircle size={11} />
          {steps.length} programs
        </div>
      </div>

      {/* Order warning */}
      <div style={{
        background: "#fffbeb", border: "1px solid #fde68a",
        borderRadius: 9, padding: "9px 13px", marginBottom: 12,
        display: "flex", alignItems: "flex-start", gap: 7,
      }}>
        <AlertTriangle size={13} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>
          <strong>Apply for OESP first</strong> — it unlocks EAP automatically. Applying out of order means waiting longer for free upgrades.
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((step, i) => {
          const isOpen = openStep === i;
          return (
            <div key={i} style={{
              background: "white",
              border: `1px solid ${isOpen ? step.border : "#e5e7eb"}`,
              borderRadius: 11, overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              {/* Row */}
              <button
                onClick={() => setOpenStep(isOpen ? null : i)}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "inherit", textAlign: "left",
                }}
              >
                {/* Number */}
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: step.bg, border: `1.5px solid ${step.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: step.color,
                }}>
                  {step.order}
                </div>

                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{step.program}</span>
                    {step.urgent && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: "#dc2626",
                        background: "#fef2f2", border: "1px solid #fecaca",
                        borderRadius: 99, padding: "1px 6px", textTransform: "uppercase" as const, letterSpacing: "0.06em",
                      }}>Urgent</span>
                    )}
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: "#6b7280",
                      background: "#f9fafb", border: "1px solid #e5e7eb",
                      borderRadius: 99, padding: "1px 6px",
                      display: "flex", alignItems: "center", gap: 3,
                    }}>
                      <Clock size={8} /> {step.time}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: "#6b7280",
                      background: "#f9fafb", border: "1px solid #e5e7eb",
                      borderRadius: 99, padding: "1px 6px",
                    }}>
                      {step.how}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{step.why}</p>
                </div>

                {isOpen ? <ChevronUp size={13} color="#9ca3af" /> : <ChevronDown size={13} color="#9ca3af" />}
              </button>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f9fafb" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 12 }}>
                    {/* Steps */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: "0 0 7px", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Steps</p>
                      <ol style={{ paddingLeft: 16, margin: 0 }}>
                        {step.steps.map((s, j) => (
                          <li key={j} style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 4 }}>{s}</li>
                        ))}
                      </ol>
                    </div>
                    {/* Documents */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: "0 0 7px", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Documents needed</p>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {step.docs.map((d, j) => (
                          <li key={j} style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 4, display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <CheckCircle size={11} color={step.color} style={{ flexShrink: 0, marginTop: 2 }} />
                            {d}
                          </li>
                        ))}
                      </ul>
                      {step.link && (
                        <a href={step.link} target="_blank" rel="noopener noreferrer" style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          marginTop: 10, fontSize: 12, color: step.color, fontWeight: 600,
                          textDecoration: "none",
                        }}>
                          Open application <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// SAVINGS VISUALIZATION
// ================================================================
function SavingsVisualization({ programs, annualBill }: { programs: Program[]; annualBill: number }) {
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;

  const cashPrograms = programs.filter((p) => p.annualSaving !== null);
  const freePrograms = programs.filter((p) => p.annualSaving === null);
  const totalCash = cashPrograms.reduce((s, p) => s + (p.annualSaving ?? 0), 0);
  const fillRatio = Math.min(annualBill > 0 ? totalCash / annualBill : 0, 1);

  const makeDots = (count: number, r: number, cx: number, cy: number) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * 2 * Math.PI - Math.PI / 2;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), delay: i * 0.015 };
    });

  const outer = makeDots(48, 130, 160, 160);
  const inner = makeDots(36, 100, 160, 160);
  const filledOuter = Math.round(fillRatio * outer.length);
  const filledInner = Math.round(fillRatio * inner.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{ position: "relative", width: "280px", height: "280px" }}>
        <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%" }}>
          {outer.map((d, i) => (
            <motion.circle key={`o${i}`} cx={d.x} cy={d.y} r="5"
              fill={i < filledOuter ? "#2563eb" : "#e5e7eb"}
              initial={animate ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: d.delay, duration: 0.25 }} />
          ))}
          {inner.map((d, i) => (
            <motion.circle key={`n${i}`} cx={d.x} cy={d.y} r="5"
              fill={i < filledInner ? "#059669" : "#e5e7eb"}
              initial={animate ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + d.delay, duration: 0.25 }} />
          ))}
        </svg>
        <motion.div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          initial={animate ? { opacity: 0, scale: 0.85 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.35 }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 3px 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>total savings</p>
          <p style={{ fontSize: "36px", fontWeight: "900", color: "#111827", margin: 0, lineHeight: 1, letterSpacing: "-0.03em" }}>${totalCash.toLocaleString()}</p>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "3px 0 0 0" }}>per year</p>
        </motion.div>
      </div>

      <motion.div style={{ display: "flex", justifyContent: "space-around", width: "100%", marginTop: "4px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}
        initial={animate ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px", justifyContent: "center" }}>
            <div style={{ width: "3px", height: "14px", borderRadius: "99px", background: "#2563eb" }} />
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>Cash credits</p>
          </div>
          <p style={{ fontSize: "18px", fontWeight: "800", color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>${totalCash.toLocaleString()}</p>
          <p style={{ fontSize: "11px", color: "#2563eb", margin: "1px 0 0 0", fontWeight: "600" }}>
            {annualBill > 0 ? `${Math.round((totalCash / annualBill) * 100)}% of bill` : "0% of bill"}
          </p>
        </div>
        <div style={{ width: "1px", background: "#f3f4f6" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px", justifyContent: "center" }}>
            <div style={{ width: "3px", height: "14px", borderRadius: "99px", background: "#059669" }} />
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>Free upgrades</p>
          </div>
          <p style={{ fontSize: "18px", fontWeight: "800", color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>{freePrograms.length}</p>
          <p style={{ fontSize: "11px", color: "#059669", margin: "1px 0 0 0", fontWeight: "600" }}>programs</p>
        </div>
      </motion.div>
    </div>
  );
}

// ================================================================
// SAVINGS MODAL
// ================================================================
function SavingsModal({ programs, billImpact, onClose }: { programs: Program[]; billImpact: DashboardData["billImpact"]; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "16px" }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        style={{ background: "white", borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 24px 48px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#111827", margin: "0 0 2px 0", letterSpacing: "-0.02em" }}>Your savings breakdown</h2>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{billImpact.ldcName}</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "7px", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={13} color="#6b7280" />
          </button>
        </div>
        <SavingsVisualization programs={programs} annualBill={billImpact.annualBill} />
        <div style={{ marginTop: "20px", background: "#f8fafc", borderRadius: "11px", padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Current annual bill</p>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#374151", margin: 0 }}>${billImpact.annualBill.toLocaleString()}</p>
          </div>
          <div style={{ height: "1px", background: "#e5e7eb", margin: "0 0 8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>After all programs</p>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#059669", margin: 0 }}>${(billImpact.annualBill - billImpact.totalAnnualSaving).toLocaleString()}</p>
          </div>
          <div style={{ height: "5px", background: "#e5e7eb", borderRadius: "99px", overflow: "hidden" }}>
            <motion.div initial={{ width: "100%" }} animate={{ width: `${100 - billImpact.savingPercentage}%` }}
              transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
              style={{ height: "100%", background: "#059669", borderRadius: "99px" }} />
          </div>
          <p style={{ fontSize: "11px", color: "#059669", margin: "5px 0 0 0", textAlign: "right", fontWeight: "600" }}>{billImpact.savingPercentage}% reduction</p>
        </div>
        <div style={{ marginTop: "16px" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px 0" }}>Per program</p>
          {programs.map((p, i) => {
            const t = TYPE_CONFIG[p.type] || TYPE_CONFIG.ongoing;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.06 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < programs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#374151" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: p.annualSaving ? t.color : "#9ca3af" }}>
                  {p.annualSaving ? `$${p.annualSaving.toLocaleString()}/yr` : "Free upgrades"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ================================================================
// PROGRAM CARD
// ================================================================
function ProgramCard({ program, onStatusChange, index }: { program: Program; onStatusChange: (id: string, s: Status) => void; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(program.documents.map(() => false));
  const t = TYPE_CONFIG[program.type] || TYPE_CONFIG.ongoing;
  const s = STATUS_CONFIG[program.status];
  const completedDocs = checked.filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
      style={{ background: "white", borderRadius: "13px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "10px" }}>
      <div style={{ height: "3px", background: t.color }} />
      <div style={{ padding: "17px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "9px" }}>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" as const }}>
            <span style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}`, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>{program.shortName}</span>
            <span style={{ background: s.bg, color: s.color, fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" }}>{s.label}</span>
          </div>
          {program.annualSaving && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: t.color, lineHeight: 1, letterSpacing: "-0.02em" }}>
                ${program.annualSaving.toLocaleString()}<span style={{ fontSize: "11px", fontWeight: "400", color: "#9ca3af" }}>/yr</span>
              </div>
              {program.monthlyCredit && <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "1px" }}>${program.monthlyCredit}/mo</div>}
            </div>
          )}
        </div>
        <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>{program.name}</h3>
        <div style={{ background: "#f8fafc", borderRadius: "0px", padding: "9px 12px", marginBottom: "12px", borderLeft: `3px solid ${t.color}` }}>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 11px 0", lineHeight: 1.55 }}>{program.description}</p>
        </div>
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" as const, alignItems: "center" }}>
          <button type="button" onClick={() => {
            if (!program.applyUrl) { alert("This program does not have an online portal. Call your local agency to apply."); return; }
            window.open(program.applyUrl, "_blank", "noopener,noreferrer");
          }} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: t.color, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", border: "none", cursor: "pointer", color: "white" }}>
            Apply now <ExternalLink size={10} />
          </button>
          <select value={program.status} onChange={(e) => onStatusChange(program.id, e.target.value as Status)}
            style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 9px", fontSize: "11px", color: "#374151", background: "white", cursor: "pointer" }}>
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="submitted">Submitted ✓</option>
          </select>
          <button onClick={() => setExpanded(!expanded)} style={{ display: "inline-flex", alignItems: "center", gap: "3px", background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 10px", fontSize: "11px", color: "#6b7280", cursor: "pointer", marginLeft: "auto" }}>
            Required Documents
            {completedDocs > 0 && <span style={{ background: t.color, color: "white", fontSize: "9px", fontWeight: "700", padding: "1px 4px", borderRadius: "9px" }}>{completedDocs}/{program.documents.length}</span>}
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
            <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 20px 14px" }}>
              <p style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 9px 0" }}>Gather before applying</p>
              {program.documents.map((doc, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", marginBottom: "7px" }}
                  onClick={() => { const u = [...checked]; u[i] = !u[i]; setChecked(u); }}>
                  <div style={{ width: "15px", height: "15px", borderRadius: "4px", flexShrink: 0, border: checked[i] ? "none" : "1.5px solid #d1d5db", background: checked[i] ? t.color : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
                    {checked[i] && <CheckCircle size={9} color="white" />}
                  </div>
                  <span style={{ fontSize: "12px", color: checked[i] ? "#9ca3af" : "#374151", textDecoration: checked[i] ? "line-through" : "none" }}>{doc}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ================================================================
// DOCUMENT MASTER CHECKLIST
// ================================================================
function DocumentMasterChecklist({ programs }: { programs: Program[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const docMap: Record<string, Program[]> = {};
  programs.forEach((p) => {
    p.documents.forEach((doc) => {
      if (!docMap[doc]) docMap[doc] = [];
      if (!docMap[doc].some((pp) => pp.id === p.id)) docMap[doc].push(p);
    });
  });

  const sharedDocs = Object.entries(docMap).filter(([, progs]) => progs.length > 1);
  const perProgramDocs = programs.map((p) => {
    const docsForProgram = p.documents.filter((doc) => (docMap[doc] || []).length === 1);
    return { program: p, docs: Array.from(new Set(docsForProgram)) };
  });

  const programDocKeys = perProgramDocs.flatMap(({ program, docs }) => docs.map((doc) => `${program.id}::${doc}`));
  const sharedDocKeys = sharedDocs.map(([doc]) => `shared::${doc}`);
  const allKeys = [...programDocKeys, ...sharedDocKeys];
  const doneCount = allKeys.filter((k) => checked[k]).length;
  const pct = allKeys.length > 0 ? Math.round((doneCount / allKeys.length) * 100) : 0;
  const allDone = doneCount === allKeys.length && allKeys.length > 0;

  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "13px", overflow: "hidden", marginTop: "20px" }}>
      <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#111827" }}>Documents checklist</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>Everything needed by program — gather once</p>
          </div>
          <span style={{ background: allDone ? "#d1fae5" : "#f3f4f6", color: allDone ? "#059669" : "#6b7280", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", flexShrink: 0 }}>
            {doneCount}/{allKeys.length} gathered
          </span>
        </div>
        <div style={{ height: "4px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "99px", background: allDone ? "#059669" : "#2563eb", width: `${pct}%`, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {perProgramDocs.map(({ program, docs }, idx) => {
        if (docs.length === 0) return null;
        const t = TYPE_CONFIG[program.type] || TYPE_CONFIG.ongoing;
        return (
          <div key={program.id} style={{ borderBottom: idx < perProgramDocs.length - 1 || sharedDocs.length > 0 ? "1px solid #f9fafb" : "none", padding: "10px 18px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{program.name}</span>
              <span style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}`, fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "99px" }}>{program.shortName}</span>
            </div>
            {docs.map((doc) => {
              const key = `${program.id}::${doc}`;
              const done = !!checked[key];
              return (
                <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "6px 0", cursor: "pointer" }}
                  onClick={() => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, marginTop: "2px", border: done ? "none" : "1.5px solid #d1d5db", background: done ? "#059669" : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
                    {done && <CheckCircle size={10} color="white" />}
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: done ? "#9ca3af" : "#374151", textDecoration: done ? "line-through" : "none", lineHeight: 1.4 }}>{doc}</p>
                </label>
              );
            })}
          </div>
        );
      })}

      {sharedDocs.length > 0 && (
        <div style={{ padding: "10px 18px 12px", borderTop: "1px solid #f3f4f6" }}>
          <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Shared documents</p>
          {sharedDocs.map(([doc, progs]) => {
            const key = `shared::${doc}`;
            const done = !!checked[key];
            return (
              <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "6px 0", cursor: "pointer" }}
                onClick={() => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))}>
                <div style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, marginTop: "2px", border: done ? "none" : "1.5px solid #d1d5db", background: done ? "#059669" : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
                  {done && <CheckCircle size={10} color="white" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 3px", fontSize: "13px", color: done ? "#9ca3af" : "#374151", textDecoration: done ? "line-through" : "none", lineHeight: 1.4 }}>{doc}</p>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" as const }}>
                    {progs.map((p) => {
                      const tt = TYPE_CONFIG[p.type] || TYPE_CONFIG.ongoing;
                      return <span key={p.id} style={{ background: tt.bg, color: tt.color, border: `1px solid ${tt.border}`, fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "99px" }}>{p.shortName}</span>;
                    })}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {allDone && (
        <div style={{ padding: "11px 18px", background: "#f0fdf4", borderTop: "1px solid #a7f3d0", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle size={13} color="#059669" />
          <p style={{ margin: 0, fontSize: "12px", color: "#059669", fontWeight: "600" }}>All documents gathered — you're ready to apply!</p>
        </div>
      )}
    </div>
  );
}

// ================================================================
// AGENCY CARD
// ================================================================
function AgencyCard({ agency }: { agency: DashboardData["agency"] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "13px", padding: "17px 20px", marginBottom: "10px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MapPin size={15} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "#92400e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px 0" }}>Your nearest LEAP office</p>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 9px 0" }}>{agency.name}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "9px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#374151" }}>
              <Phone size={11} color="#d97706" /> <strong>{agency.phone}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#374151" }}>
              <Clock size={11} color="#d97706" /> {agency.hours}
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "#78350f", lineHeight: 1.6, margin: "0 0 12px 0" }}>{agency.note}</p>
          <div style={{ display: "flex", gap: "7px" }}>
            <a href={`tel:${agency.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#d97706", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", textDecoration: "none" }}>
              <Phone size={10} /> Call now
            </a>
            {agency.onlinePortal && (
              <a href={agency.onlinePortal} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "white", color: "#d97706", border: "1px solid #d97706", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", textDecoration: "none" }}>
                <ExternalLink size={10} /> Website
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ================================================================
// MAIN DASHBOARD
// ================================================================
export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(DUMMY);
  const [programs, setPrograms] = useState<Program[]>(DUMMY.programs);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showSavings, setShowSavings] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("eligibilityResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DashboardData;
        setData(parsed);
        let progs: Program[] = parsed.programs;
        const statusRaw = sessionStorage.getItem("programStatuses");
        if (statusRaw) {
          try {
            const statusMap = JSON.parse(statusRaw) as Record<string, Status>;
            progs = progs.map((p) => statusMap[p.id] ? { ...p, status: statusMap[p.id] } : p);
          } catch { /* ignore */ }
        }
        setPrograms(progs);
      } catch { /* fallback uses DUMMY */ }
    }
    setLoaded(true);
  }, []);

  const hasLEAP = programs.some((p) => p.id === "leap");
  const visibleAlerts = data.alerts.filter((a) => !dismissed.includes(a.id));
  const submittedCount = programs.filter((p) => p.status === "submitted").length;
  const cashPrograms = programs.filter((p) => p.annualSaving !== null);

  function handleStatus(id: string, status: Status) {
    setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const statusRaw = sessionStorage.getItem("programStatuses");
    const statusMap: Record<string, Status> = statusRaw ? JSON.parse(statusRaw) : {};
    statusMap[id] = status;
    sessionStorage.setItem("programStatuses", JSON.stringify(statusMap));
  }

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: "13px", color: "#9ca3af" }}>Loading your benefits...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 900px) {
          .results-layout { flex-direction: column; }
          .results-right { position: static !important; max-width: 100% !important; margin-top: 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "0 20px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logor.png" alt="SubsidyAccess" style={{ height: 32, width: "auto" }} />
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#111827", letterSpacing: "-0.02em" }}>SubsidyAccess</span>
        </Link>
        {submittedCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: "20px", padding: "3px 9px", fontSize: "11px", fontWeight: "600", color: "#059669" }}>
            <CheckCircle size={10} /> {submittedCount} submitted
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "20px 24px 60px" }}>
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "14px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#111827", margin: "0 0 3px 0", letterSpacing: "-0.03em" }}>Your energy benefits</h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
            {programs.length} programs matched —{" "}
            <strong style={{ color: "#059669" }}>${data.billImpact.totalAnnualSaving.toLocaleString()}/year</strong> in potential savings
          </p>
        </motion.div>

        {/* ALERTS */}
        {visibleAlerts.length > 0 && (
          <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {visibleAlerts.map((alert, i) => (
              <motion.div key={alert.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "9px", padding: "8px 10px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Bell size={12} color="#2563eb" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 1px 0", fontSize: "12px", fontWeight: "700", color: "#1e40af" }}>{alert.title}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#374151", lineHeight: 1.5 }}>{alert.message}</p>
                </div>
                <button onClick={() => setDismissed([...dismissed, alert.id])} style={{ background: "none", border: "none", cursor: "pointer", color: "#93c5fd", padding: 0 }}>
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* 60/40 LAYOUT */}
        <div className="results-layout" style={{ display: "flex", gap: "18px", alignItems: "flex-start", marginTop: "4px" }}>

          {/* LEFT */}
          <div style={{ flex: 3, minWidth: 0 }}>
            <p style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px 0" }}>
              Programs you qualify for
            </p>

            {programs.map((program, i) => (
              <ProgramCard key={program.id} program={program} onStatusChange={handleStatus} index={i} />
            ))}

            {hasLEAP && (
              <>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: "14px 0 8px 0" }}>LEAP intake agency</p>
                <AgencyCard agency={data.agency} />
              </>
            )}

            {/* DOCUMENT CHECKLIST */}
            <DocumentMasterChecklist programs={programs} />

            {/* APPLICATION GUIDE — all steps unlocked */}
            <ApplicationGuide programs={programs} />
          </div>

          {/* RIGHT */}
          <div className="results-right" style={{ flex: 2.3, minWidth: "280px", maxWidth: "420px", position: "sticky", top: 72 }}>

            {/* SAVINGS BANNER */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1e40af 100%)", borderRadius: "16px", padding: "16px 18px", marginBottom: "8px", color: "white", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-16px", right: "-16px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(59,130,246,0.12)", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "10px", opacity: 0.5, margin: "0 0 2px 0", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{data.billImpact.ldcName}</p>
                  <p style={{ fontSize: "11px", opacity: 0.6, margin: "0 0 8px 0" }}>Current annual bill: <strong style={{ color: "white" }}>${data.billImpact.annualBill.toLocaleString()}</strong></p>
                  <p style={{ fontSize: "10px", opacity: 0.5, margin: "0 0 2px 0" }}>Potential annual savings</p>
                  <p style={{ fontSize: "30px", fontWeight: "900", margin: 0, lineHeight: 1, color: "#34d399", letterSpacing: "-0.03em" }}>${data.billImpact.totalAnnualSaving.toLocaleString()}</p>
                </div>
                <div style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "9px", padding: "6px 10px", textAlign: "center" as const }}>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: "#34d399" }}>{data.billImpact.savingPercentage}%</p>
                  <p style={{ margin: 0, fontSize: "10px", opacity: 0.6 }}>of bill</p>
                </div>
              </div>
            </motion.div>

            {/* SAVINGS VISUALIZATION */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "12px 8px 8px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#111827" }}>How your savings add up</p>
                <span style={{ fontSize: "10px", color: "#6b7280" }}>vs. your ${data.billImpact.annualBill.toLocaleString()}/year bill</span>
              </div>
              <SavingsVisualization programs={programs} annualBill={data.billImpact.annualBill} />
            </div>

            {/* SAVINGS BREAKDOWN */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "10px 12px", marginBottom: "8px", fontSize: "12px", color: "#4b5563" }}>
              <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: "12px", color: "#111827" }}>Savings by program</p>
              {cashPrograms.length === 0 && <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>Your programs mainly reduce usage over time.</p>}
              {cashPrograms.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span>{p.shortName}</span>
                  <span>${(p.annualSaving ?? 0).toLocaleString()}/year</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSavings && (
          <SavingsModal programs={programs} billImpact={data.billImpact} onClose={() => setShowSavings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}