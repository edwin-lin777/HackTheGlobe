"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  Bolt,
  Home,
  Leaf,
  Snowflake,
  Mountain,
  Wrench,
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
        "A monthly credit applied directly to your electricity bill — automatic.",
      applyUrl: "https://ontarioelectricitysupport.ca",
      annualSaving: 540,
      monthlyCredit: 45,
      status: "not_started",
      howToApply:
        "Apply online at OESP.ca in about 10 minutes. You will need your electricity account number and SIN of all household members 18+.",
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
        "A one-time emergency grant of up to $650 if you are behind on your electricity or gas bill.",
      applyUrl: null,
      annualSaving: 650,
      monthlyCredit: null,
      status: "not_started",
      howToApply:
        "Cannot apply online. You must call or visit your local LEAP intake agency. See the agency card below.",
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
        "Free home upgrades — smart thermostat, LED bulbs, fridge replacement. Auto-qualifies with OESP.",
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
        "Free weatherization — draft proofing, insulation, smart thermostat for Enbridge customers.",
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

// All 6 programs for the program showcase
const ALL_PROGRAMS = [
  {
    id: "oesp",
    name: "Ontario Electricity Support Program",
    shortName: "OESP",
    benefit: "$35–$113/mo",
    type: "ongoing",
    icon: "bolt",
    desc: "Monthly on-bill credit",
  },
  {
    id: "leap",
    name: "Low-income Energy Assistance Program",
    shortName: "LEAP",
    benefit: "Up to $780",
    type: "emergency",
    icon: "alert",
    desc: "Emergency bill grant",
  },
  {
    id: "eap",
    name: "Energy Affordability Program",
    shortName: "EAP",
    benefit: "Free upgrades",
    type: "retrofit",
    icon: "home",
    desc: "Smart thermostat, LEDs, fridge",
  },
  {
    id: "enbridge_winterproofing",
    name: "Enbridge Home Winterproofing",
    shortName: "Winterproofing",
    benefit: "Free upgrades",
    type: "retrofit",
    icon: "snowflake",
    desc: "Insulation & weatherization",
  },
  {
    id: "noec",
    name: "Northern Ontario Energy Credit",
    shortName: "NOEC",
    benefit: "Tax credit",
    type: "tax_credit",
    icon: "mountain",
    desc: "Annual Trillium benefit",
  },
  {
    id: "home_renovation_savings",
    name: "Home Renovation Savings",
    shortName: "Home Reno",
    benefit: "Rebates",
    type: "rebate",
    icon: "wrench",
    desc: "Heat pumps & insulation",
  },
];

// ================================================================
// CONFIGS
// ================================================================
const TYPE_CONFIG: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  ongoing: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  emergency: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  retrofit: { color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
  rebate: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  tax_credit: { color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
};

const STATUS_CONFIG: Record<
  Status,
  { color: string; bg: string; label: string }
> = {
  not_started: { color: "#6b7280", bg: "#f3f4f6", label: "Not started" },
  in_progress: { color: "#d97706", bg: "#fef3c7", label: "In progress" },
  submitted: { color: "#059669", bg: "#d1fae5", label: "Submitted" },
};

// ================================================================
// PROGRAM ICON
// ================================================================
function ProgramIcon({
  icon,
  color,
  size = 16,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const props = { size, color };
  switch (icon) {
    case "bolt":
      return <Zap {...props} />;
    case "alert":
      return <Bell {...props} />;
    case "home":
      return <Home {...props} />;
    case "snowflake":
      return <Snowflake {...props} />;
    case "mountain":
      return <Mountain {...props} />;
    case "wrench":
      return <Wrench {...props} />;
    default:
      return <Leaf {...props} />;
  }
}

// ================================================================
// PROGRAM SHOWCASE — scrolling marquee of all 6 programs
// ================================================================
function ProgramShowcase({ matchedIds }: { matchedIds: string[] }) {
  const doubled = [...ALL_PROGRAMS, ...ALL_PROGRAMS];

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          padding: "0 24px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          Ontario energy programs
        </p>
        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
          <strong style={{ color: "#059669" }}>{matchedIds.length}</strong> of 6
          matched
        </p>
      </div>

      {/* Scrolling marquee */}
      <div style={{ overflow: "hidden", position: "relative" }}>
        {/* Fade edges */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "80px",
            zIndex: 2,
            background: "linear-gradient(to right, #f8fafc, transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "80px",
            zIndex: 2,
            background: "linear-gradient(to left, #f8fafc, transparent)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{
            display: "flex",
            gap: "10px",
            width: "max-content",
            padding: "4px 0 8px 0",
          }}
        >
          {doubled.map((prog, i) => {
            const t = TYPE_CONFIG[prog.type] || TYPE_CONFIG.ongoing;
            const isMatched = matchedIds.includes(prog.id);
            return (
              <div
                key={`${prog.id}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: isMatched ? "white" : "#f3f4f6",
                  border: `1px solid ${isMatched ? t.border : "#e5e7eb"}`,
                  borderRadius: "12px",
                  padding: "10px 16px",
                  minWidth: "220px",
                  flexShrink: 0,
                  opacity: isMatched ? 1 : 0.55,
                  position: "relative",
                }}
              >
                {/* Matched indicator */}
                {isMatched && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #f8fafc",
                    }}
                  >
                    <CheckCircle size={9} color="white" />
                  </div>
                )}

                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: isMatched ? t.bg : "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ProgramIcon
                    icon={prog.icon}
                    color={isMatched ? t.color : "#9ca3af"}
                    size={15}
                  />
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 1px 0",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: isMatched ? "#111827" : "#9ca3af",
                    }}
                  >
                    {prog.shortName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: isMatched ? t.color : "#9ca3af",
                      fontWeight: "600",
                    }}
                  >
                    {prog.benefit}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

// ================================================================
// 21DEV SAVINGS VISUALIZATION
// ================================================================
function SavingsVisualization({
  programs,
  annualBill,
}: {
  programs: Program[];
  annualBill: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;

  const cashPrograms = programs.filter((p) => p.annualSaving !== null);
  const freePrograms = programs.filter((p) => p.annualSaving === null);
  const totalCash = cashPrograms.reduce((s, p) => s + (p.annualSaving ?? 0), 0);
  const fillRatio = Math.min(totalCash / annualBill, 1);

  const makeDots = (count: number, r: number, cx: number, cy: number) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * 2 * Math.PI - Math.PI / 2;
      return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a),
        delay: i * 0.015,
      };
    });

  const outer = makeDots(48, 130, 160, 160);
  const inner = makeDots(36, 100, 160, 160);
  const filledOuter = Math.round(fillRatio * outer.length);
  const filledInner = Math.round(fillRatio * inner.length);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div style={{ position: "relative", width: "260px", height: "260px" }}>
        <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%" }}>
          {outer.map((d, i) => (
            <motion.circle
              key={`o${i}`}
              cx={d.x}
              cy={d.y}
              r="5"
              fill={i < filledOuter ? "#2563eb" : "#e5e7eb"}
              initial={
                animate ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: d.delay, duration: 0.22 }}
            />
          ))}
          {inner.map((d, i) => (
            <motion.circle
              key={`n${i}`}
              cx={d.x}
              cy={d.y}
              r="5"
              fill={i < filledInner ? "#059669" : "#e5e7eb"}
              initial={
                animate ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22 + d.delay, duration: 0.22 }}
            />
          ))}
        </svg>
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          initial={animate ? { opacity: 0, scale: 0.85 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "#9ca3af",
              margin: "0 0 2px 0",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            total savings
          </p>
          <p
            style={{
              fontSize: "34px",
              fontWeight: "900",
              color: "#111827",
              margin: 0,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            ${totalCash.toLocaleString()}
          </p>
          <p
            style={{ fontSize: "11px", color: "#6b7280", margin: "3px 0 0 0" }}
          >
            per year
          </p>
        </motion.div>
      </div>

      <motion.div
        style={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%",
          paddingTop: "14px",
          borderTop: "1px solid #f3f4f6",
        }}
        initial={animate ? { opacity: 0, y: 8 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "2px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "12px",
                borderRadius: "99px",
                background: "#2563eb",
              }}
            />
            <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
              Cash credits
            </p>
          </div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
            }}
          >
            ${totalCash.toLocaleString()}
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "#2563eb",
              margin: "1px 0 0 0",
              fontWeight: "600",
            }}
          >
            {Math.round((totalCash / annualBill) * 100)}% of bill
          </p>
        </div>
        <div style={{ width: "1px", background: "#f3f4f6" }} />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "2px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "12px",
                borderRadius: "99px",
                background: "#059669",
              }}
            />
            <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
              Free upgrades
            </p>
          </div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
            }}
          >
            {freePrograms.length}
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "#059669",
              margin: "1px 0 0 0",
              fontWeight: "600",
            }}
          >
            programs
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ================================================================
// SAVINGS MODAL
// ================================================================
function SavingsModal({
  programs,
  billImpact,
  onClose,
}: {
  programs: Program[];
  billImpact: DashboardData["billImpact"];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "22px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "800",
                color: "#111827",
                margin: "0 0 2px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Savings breakdown
            </h2>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
              {billImpact.ldcName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "7px",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={12} color="#6b7280" />
          </button>
        </div>

        <SavingsVisualization
          programs={programs}
          annualBill={billImpact.annualBill}
        />

        <div
          style={{
            marginTop: "16px",
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "7px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
              Current annual bill
            </p>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#374151",
                margin: 0,
              }}
            >
              ${billImpact.annualBill.toLocaleString()}
            </p>
          </div>
          <div
            style={{
              height: "1px",
              background: "#e5e7eb",
              margin: "0 0 7px 0",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "7px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
              After all programs
            </p>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#059669",
                margin: 0,
              }}
            >
              $
              {(
                billImpact.annualBill - billImpact.totalAnnualSaving
              ).toLocaleString()}
            </p>
          </div>
          <div
            style={{
              height: "5px",
              background: "#e5e7eb",
              borderRadius: "99px",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${100 - billImpact.savingPercentage}%` }}
              transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "#059669",
                borderRadius: "99px",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "10px",
              color: "#059669",
              margin: "4px 0 0 0",
              textAlign: "right",
              fontWeight: "600",
            }}
          >
            {billImpact.savingPercentage}% reduction
          </p>
        </div>

        <div style={{ marginTop: "14px" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 8px 0",
            }}
          >
            Per program
          </p>
          {programs.map((p, i) => {
            const t = TYPE_CONFIG[p.type] || TYPE_CONFIG.ongoing;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 0",
                  borderBottom:
                    i < programs.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: t.color,
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#374151" }}>
                    {p.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: p.annualSaving ? t.color : "#9ca3af",
                  }}
                >
                  {p.annualSaving
                    ? `$${p.annualSaving.toLocaleString()}/yr`
                    : "Free upgrades"}
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
function ProgramCard({
  program,
  onStatusChange,
  index,
}: {
  program: Program;
  onStatusChange: (id: string, s: Status) => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(
    program.documents.map(() => false),
  );
  const t = TYPE_CONFIG[program.type] || TYPE_CONFIG.ongoing;
  const s = STATUS_CONFIG[program.status];
  const completedDocs = checked.filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28, ease: "easeOut" }}
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        marginBottom: "8px",
      }}
    >
      <div style={{ height: "2px", background: t.color }} />
      <div style={{ padding: "16px 18px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            <span
              style={{
                background: t.bg,
                color: t.color,
                border: `1px solid ${t.border}`,
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              {program.shortName}
            </span>
            <span
              style={{
                background: s.bg,
                color: s.color,
                fontSize: "10px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              {s.label}
            </span>
          </div>
          {program.annualSaving && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: t.color,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                ${program.annualSaving.toLocaleString()}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "400",
                    color: "#9ca3af",
                  }}
                >
                  /yr
                </span>
              </div>
              {program.monthlyCredit && (
                <div style={{ fontSize: "10px", color: "#9ca3af" }}>
                  ${program.monthlyCredit}/mo
                </div>
              )}
            </div>
          )}
        </div>

        <h3
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#111827",
            margin: "0 0 3px 0",
          }}
        >
          {program.name}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: "0 0 10px 0",
            lineHeight: 1.5,
          }}
        >
          {program.description}
        </p>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "7px",
            padding: "8px 11px",
            marginBottom: "11px",
            borderLeft: `3px solid ${t.color}`,
          }}
        >
          <p
            style={{
              fontSize: "9px",
              fontWeight: "700",
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 2px 0",
            }}
          >
            How to apply
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "#374151",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {program.howToApply}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {program.applyUrl && (
            <a
              href={program.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: t.color,
                color: "white",
                padding: "6px 11px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Apply now <ExternalLink size={9} />
            </a>
          )}
          <select
            value={program.status}
            onChange={(e) =>
              onStatusChange(program.id, e.target.value as Status)
            }
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "6px 8px",
              fontSize: "11px",
              color: "#374151",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="submitted">Submitted ✓</option>
          </select>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              background: "none",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "6px 9px",
              fontSize: "11px",
              color: "#6b7280",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            Docs
            {completedDocs > 0 && (
              <span
                style={{
                  background: t.color,
                  color: "white",
                  fontSize: "9px",
                  fontWeight: "700",
                  padding: "1px 4px",
                  borderRadius: "8px",
                }}
              >
                {completedDocs}/{program.documents.length}
              </span>
            )}
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                padding: "11px 18px 13px",
              }}
            >
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 8px 0",
                }}
              >
                Gather before applying
              </p>
              {program.documents.map((doc, i) => (
                <label
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    marginBottom: "6px",
                  }}
                  onClick={() => {
                    const u = [...checked];
                    u[i] = !u[i];
                    setChecked(u);
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "3px",
                      flexShrink: 0,
                      border: checked[i] ? "none" : "1.5px solid #d1d5db",
                      background: checked[i] ? t.color : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.12s",
                    }}
                  >
                    {checked[i] && <CheckCircle size={9} color="white" />}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: checked[i] ? "#9ca3af" : "#374151",
                      textDecoration: checked[i] ? "line-through" : "none",
                    }}
                  >
                    {doc}
                  </span>
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
// AGENCY CARD
// ================================================================
function AgencyCard({ agency }: { agency: DashboardData["agency"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: "12px",
        padding: "16px 18px",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "#d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MapPin size={15} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "9px",
              fontWeight: "700",
              color: "#92400e",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 2px 0",
            }}
          >
            Your nearest LEAP office
          </p>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 8px 0",
            }}
          >
            {agency.name}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: "#374151",
              }}
            >
              <Phone size={10} color="#d97706" />{" "}
              <strong>{agency.phone}</strong>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: "#374151",
              }}
            >
              <Clock size={10} color="#d97706" /> {agency.hours}
            </div>
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "#78350f",
              lineHeight: 1.6,
              margin: "0 0 10px 0",
            }}
          >
            {agency.note}
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            <a
              href={`tel:${agency.phone}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#d97706",
                color: "white",
                padding: "6px 11px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <Phone size={9} /> Call now
            </a>
            {agency.onlinePortal && (
              <a
                href={agency.onlinePortal}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "white",
                  color: "#d97706",
                  border: "1px solid #d97706",
                  padding: "6px 11px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={9} /> Website
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
  const [data] = useState<DashboardData>(DUMMY);
  const [programs, setPrograms] = useState<Program[]>(DUMMY.programs);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showSavings, setShowSavings] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ---- SWAP IN WHEN BACKEND IS READY ----
  // useEffect(() => {
  //   const stored = sessionStorage.getItem("eligibilityResult")
  //   if (stored) {
  //     const parsed = JSON.parse(stored)
  //     setPrograms(parsed.programs)
  //   }
  //   setLoaded(true)
  // }, [])
  // ----------------------------------------

  useEffect(() => {
    setLoaded(true);
  }, []);

  const hasLEAP = programs.some((p) => p.id === "leap");
  const visibleAlerts = data.alerts.filter((a) => !dismissed.includes(a.id));
  const submittedCount = programs.filter(
    (p) => p.status === "submitted",
  ).length;
  const matchedIds = programs.map((p) => p.id);

  function handleStatus(id: string, status: Status) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
  }

  if (!loaded)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>Loading...</p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* NAV */}
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
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
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
              fontSize: "14px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            SubsidyAccess
          </span>
        </div>
        {submittedCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#f0fdf4",
              border: "1px solid #a7f3d0",
              borderRadius: "20px",
              padding: "3px 9px",
              fontSize: "11px",
              fontWeight: "600",
              color: "#059669",
            }}
          >
            <CheckCircle size={10} /> {submittedCount} submitted
          </div>
        )}
      </nav>

      {/* FULL WIDTH CONTENT */}
      <div style={{ padding: "24px 28px 60px" }}>
        {/* Top section: header + banner side by side on wide screens */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "20px",
            marginBottom: "20px",
            alignItems: "start",
          }}
        >
          {/* Left: header + alerts + programs */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: "16px" }}
            >
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "900",
                  color: "#111827",
                  margin: "0 0 3px 0",
                  letterSpacing: "-0.03em",
                }}
              >
                Your energy benefits
              </h1>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                {programs.length} programs matched —{" "}
                <strong style={{ color: "#059669" }}>
                  ${data.billImpact.totalAnnualSaving.toLocaleString()}/year
                </strong>{" "}
                in potential savings
              </p>
            </motion.div>

            {/* Alerts */}
            {visibleAlerts.length > 0 && (
              <div
                style={{
                  marginBottom: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                {visibleAlerts.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "9px",
                      padding: "9px 12px",
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                    }}
                  >
                    <Bell
                      size={12}
                      color="#2563eb"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: "0 0 1px 0",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#1e40af",
                        }}
                      >
                        {alert.title}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: "#374151",
                          lineHeight: 1.5,
                        }}
                      >
                        {alert.message}
                      </p>
                    </div>
                    <button
                      onClick={() => setDismissed([...dismissed, alert.id])}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#93c5fd",
                        padding: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Program cards */}
            <p
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 10px 0",
              }}
            >
              Programs you qualify for
            </p>
            {programs.map((p, i) => (
              <ProgramCard
                key={p.id}
                program={p}
                onStatusChange={handleStatus}
                index={i}
              />
            ))}

            {/* LEAP Agency */}
            {hasLEAP && (
              <>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "14px 0 8px 0",
                  }}
                >
                  LEAP intake agency
                </p>
                <AgencyCard agency={data.agency} />
              </>
            )}
          </div>

          {/* Right: sticky savings banner */}
          <div style={{ position: "sticky", top: "68px" }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              style={{
                background:
                  "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1e40af 100%)",
                borderRadius: "16px",
                padding: "22px 24px",
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-16px",
                  right: "-16px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "rgba(59,130,246,0.12)",
                  pointerEvents: "none",
                }}
              />

              <p
                style={{
                  fontSize: "10px",
                  opacity: 0.5,
                  margin: "0 0 1px 0",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {data.billImpact.ldcName}
              </p>
              <p
                style={{ fontSize: "11px", opacity: 0.6, margin: "0 0 10px 0" }}
              >
                Current bill:{" "}
                <strong style={{ color: "white" }}>
                  ${data.billImpact.annualBill.toLocaleString()}/yr
                </strong>
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      opacity: 0.5,
                      margin: "0 0 1px 0",
                    }}
                  >
                    Potential savings
                  </p>
                  <p
                    style={{
                      fontSize: "40px",
                      fontWeight: "900",
                      margin: 0,
                      lineHeight: 1,
                      color: "#34d399",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    ${data.billImpact.totalAnnualSaving.toLocaleString()}
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(52,211,153,0.15)",
                    border: "1px solid rgba(52,211,153,0.25)",
                    borderRadius: "9px",
                    padding: "7px 11px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "900",
                      color: "#34d399",
                    }}
                  >
                    {data.billImpact.savingPercentage}%
                  </p>
                  <p style={{ margin: 0, fontSize: "10px", opacity: 0.6 }}>
                    of bill
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "10px", opacity: 0.45 }}>
                    Progress
                  </span>
                  <span style={{ fontSize: "10px", opacity: 0.45 }}>
                    {submittedCount}/{programs.length} submitted
                  </span>
                </div>
                <div
                  style={{
                    height: "3px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "99px",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${programs.length > 0 ? (submittedCount / programs.length) * 100 : 0}%`,
                    }}
                    transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      borderRadius: "99px",
                      background: "linear-gradient(90deg, #34d399, #10b981)",
                    }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                {[
                  {
                    label: "Monthly saving",
                    value: `$${Math.round(data.billImpact.totalAnnualSaving / 12)}/mo`,
                  },
                  {
                    label: "Programs matched",
                    value: `${programs.length} of 6`,
                  },
                  {
                    label: "Cash credits",
                    value: `$${programs
                      .filter((p) => p.annualSaving)
                      .reduce((s, p) => s + (p.annualSaving ?? 0), 0)
                      .toLocaleString()}`,
                  },
                  {
                    label: "Free upgrades",
                    value: `${programs.filter((p) => !p.annualSaving).length} programs`,
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: "8px",
                      padding: "8px 10px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 1px 0",
                        fontSize: "9px",
                        opacity: 0.55,
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "white",
                      }}
                    >
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setShowSavings(true)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  padding: "9px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.85)",
                  cursor: "pointer",
                }}
              >
                <TrendingUp size={12} /> View savings breakdown{" "}
                <ArrowRight size={11} />
              </button>
            </motion.div>

            {/* Footer disclaimer */}
            <div
              style={{
                marginTop: "10px",
                padding: "10px 13px",
                background: "white",
                borderRadius: "9px",
                border: "1px solid #e5e7eb",
                display: "flex",
                gap: "7px",
                alignItems: "flex-start",
              }}
            >
              <AlertCircle
                size={11}
                color="#9ca3af"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "10px",
                  color: "#9ca3af",
                  lineHeight: 1.6,
                }}
              >
                Based on real 2026 OEB rate data. Actual amounts may vary.
              </p>
            </div>
          </div>
        </div>

        {/* PROGRAM SHOWCASE — full width marquee */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
          <ProgramShowcase matchedIds={matchedIds} />
        </div>
      </div>

      {/* SAVINGS MODAL */}
      <AnimatePresence>
        {showSavings && (
          <SavingsModal
            programs={programs}
            billImpact={data.billImpact}
            onClose={() => setShowSavings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
