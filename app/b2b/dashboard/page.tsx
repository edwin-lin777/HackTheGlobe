"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";

import { handleExportReport } from "@/lib/exportReport";

// ================================================================
// DUMMY DATA — replace with real Supabase queries later
// ================================================================
const STATS = {
  eligibilityChecks: 14208,
  programsMatched: 12847,
  applicationsStarted: 8412,
  confirmedEnrollments: 6103,
  dollarsReturned: 3295620,
  enrollmentRate: 61,
  prevEnrollmentRate: 28,
  totalEligibleHouseholds: 15500,
};

const PROGRAM_BREAKDOWN = [
  {
    id: "oesp",
    name: "OESP",
    enrolled: 4200,
    dollarsPer: 540,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    id: "leap",
    name: "LEAP",
    enrolled: 890,
    dollarsPer: 650,
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    id: "eap",
    name: "EAP",
    enrolled: 3800,
    dollarsPer: null,
    color: "#059669",
    bg: "#f0fdf4",
  },
  {
    id: "enbridge",
    name: "Winterproofing",
    enrolled: 620,
    dollarsPer: null,
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    id: "noec",
    name: "NOEC",
    enrolled: 210,
    dollarsPer: 158,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    id: "homereno",
    name: "Home Reno",
    enrolled: 383,
    dollarsPer: 200,
    color: "#d97706",
    bg: "#fffbeb",
  },
];

const BUILDING_DATA = [
  { name: "Regent Park", units: 2083, checks: 1840, enrolled: 1320, rate: 72 },
  {
    name: "Lawrence Heights",
    units: 1490,
    checks: 1102,
    enrolled: 793,
    rate: 72,
  },
  { name: "Alexandra Park", units: 686, checks: 580, enrolled: 392, rate: 68 },
  { name: "Moss Park", units: 714, checks: 490, enrolled: 320, rate: 65 },
  { name: "Don Mount Court", units: 232, checks: 180, enrolled: 110, rate: 61 },
  { name: "Swansea Mews", units: 262, checks: 140, enrolled: 70, rate: 50 },
  { name: "Firgrove", units: 473, checks: 210, enrolled: 84, rate: 40 },
  { name: "Edgeley Village", units: 394, checks: 120, enrolled: 42, rate: 35 },
  { name: "Jamestown", units: 538, checks: 130, enrolled: 39, rate: 30 },
  { name: "Rexdale Cluster", units: 412, checks: 80, enrolled: 20, rate: 20 },
];

const MONTHLY_DATA = [
  { month: "Jul", checks: 820, enrolled: 310 },
  { month: "Aug", checks: 940, enrolled: 390 },
  { month: "Sep", checks: 1100, enrolled: 480 },
  { month: "Oct", checks: 1350, enrolled: 590 },
  { month: "Nov", checks: 1580, enrolled: 720 },
  { month: "Dec", checks: 1420, enrolled: 650 },
  { month: "Jan", checks: 1690, enrolled: 810 },
  { month: "Feb", checks: 1820, enrolled: 920 },
  { month: "Mar", checks: 2100, enrolled: 1100 },
  { month: "Apr", checks: 2488, enrolled: 1133 },
];

// ================================================================
// HELPERS
// ================================================================
function fmt(n: number) {
  return n.toLocaleString();
}
function fmtDollar(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

// ================================================================
// STAT CARD
// ================================================================
// Change StatCard to show week-over-week change
function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
  delta?: string; // e.g. "+143 this week"
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <p
          style={{ margin: 0, fontSize: 12, color: "#6b7280", fontWeight: 600 }}
        >
          {label}
        </p>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: accent + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: 26,
            fontWeight: 900,
            color: "#111827",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{sub}</p>
        )}
        {delta && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 11,
              color: "#059669",
              fontWeight: 600,
            }}
          >
            ↑ {delta}
          </p>
        )}
      </div>
    </div>
  );
}

// ================================================================
// ENROLLMENT RATE RING
// ================================================================
function EnrollmentRing({ rate, prev }: { rate: number; prev: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1,
            }}
          >
            {rate}%
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 9,
              color: "#6b7280",
              fontWeight: 600,
            }}
          >
            enrolled
          </p>
        </div>
      </div>
      <div>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 12,
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          Enrollment rate
        </p>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 13,
            color: "#111827",
            fontWeight: 700,
          }}
        >
          {fmt(STATS.confirmedEnrollments)} of{" "}
          {fmt(STATS.totalEligibleHouseholds)} eligible
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "#f0fdf4",
            border: "1px solid #a7f3d0",
            borderRadius: 99,
            padding: "3px 8px",
          }}
        >
          <ArrowUpRight size={10} color="#059669" />
          <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
            Up from {prev}% — +{rate - prev}pp this year
          </span>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// MINI BAR CHART
// ================================================================
function TrendChart({ data }: { data: typeof MONTHLY_DATA }) {
  const maxChecks = Math.max(...data.map((d) => d.checks));
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <p
          style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}
        >
          Monthly activity
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: "#e5e7eb",
              }}
            />
            <span style={{ fontSize: 10, color: "#9ca3af" }}>Checks</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: "#1d4ed8",
              }}
            />
            <span style={{ fontSize: 10, color: "#9ca3af" }}>Enrolled</span>
          </div>
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: 2,
                alignItems: "flex-end",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "#e5e7eb",
                  borderRadius: "3px 3px 0 0",
                  height: `${(d.checks / maxChecks) * 100}%`,
                  minHeight: 4,
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: "#1d4ed8",
                  borderRadius: "3px 3px 0 0",
                  height: `${(d.enrolled / maxChecks) * 100}%`,
                  minHeight: 4,
                }}
              />
            </div>
            <span style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>
              {d.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// BUILDING TABLE
// ================================================================
function BuildingTable() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? BUILDING_DATA : BUILDING_DATA.slice(0, 5);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 1px",
              fontSize: 13,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Building-level breakdown
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
            Focus outreach on buildings with lowest enrollment
          </p>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#9ca3af",
            background: "#f3f4f6",
            padding: "3px 8px",
            borderRadius: 99,
          }}
        >
          {BUILDING_DATA.length} buildings
        </span>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 80px 80px 80px 100px",
          gap: 0,
          padding: "8px 20px",
          background: "#f9fafb",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        {["Building", "Units", "Checks", "Enrolled", "Rate"].map((h, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              textAlign: i > 0 ? "right" : "left",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {displayed.map((b, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 80px 80px 80px 100px",
            padding: "11px 20px",
            borderBottom:
              i < displayed.length - 1 ? "1px solid #f9fafb" : "none",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>
            {b.name}
          </span>
          <span style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
            {fmt(b.units)}
          </span>
          <span style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
            {fmt(b.checks)}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#111827",
              fontWeight: 600,
              textAlign: "right",
            }}
          >
            {fmt(b.enrolled)}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 4,
                background: "#f3f4f6",
                borderRadius: 99,
                overflow: "hidden",
                maxWidth: 48,
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background:
                    b.rate >= 60
                      ? "#059669"
                      : b.rate >= 40
                        ? "#d97706"
                        : "#dc2626",
                  width: `${b.rate}%`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                minWidth: 32,
                textAlign: "right",
                color:
                  b.rate >= 60
                    ? "#059669"
                    : b.rate >= 40
                      ? "#d97706"
                      : "#dc2626",
              }}
            >
              {b.rate}%
            </span>
          </div>
        </div>
      ))}

      <button
        onClick={() => setShowAll(!showAll)}
        style={{
          width: "100%",
          padding: "10px 20px",
          background: "#f9fafb",
          border: "none",
          borderTop: "1px solid #f3f4f6",
          fontSize: 12,
          color: "#6b7280",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontFamily: "inherit",
        }}
      >
        {showAll ? (
          <>
            <ChevronUp size={12} /> Show less
          </>
        ) : (
          <>
            <ChevronDown size={12} /> Show all {BUILDING_DATA.length} buildings
          </>
        )}
      </button>
    </div>
  );
}

// ================================================================
// PROGRAM BREAKDOWN
// ================================================================
function ProgramBreakdown() {
  const maxEnrolled = Math.max(...PROGRAM_BREAKDOWN.map((p) => p.enrolled));
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: "18px 20px",
      }}
    >
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 13,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Program enrollment
      </p>
      {PROGRAM_BREAKDOWN.map((p, i) => (
        <div
          key={i}
          style={{ marginBottom: i < PROGRAM_BREAKDOWN.length - 1 ? 12 : 0 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  background: p.bg,
                  color: p.color,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 99,
                }}
              >
                {p.name}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                {fmt(p.enrolled)} enrolled
              </span>
              {p.dollarsPer && (
                <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>
                  {fmtDollar(p.enrolled * p.dollarsPer)}/yr
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              height: 5,
              background: "#f3f4f6",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: p.color,
                width: `${(p.enrolled / maxEnrolled) * 100}%`,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// CITY REPORT EXPORT CARD
// ================================================================
function CityReportCard() {
  return (
    <div
      style={{
        background: "#0f172a",
        borderRadius: 14,
        padding: "18px 20px",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 2px",
              fontSize: 13,
              fontWeight: 700,
              color: "white",
            }}
          >
            City Council report
          </p>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>
            Ready to export — Q1 2026
          </p>
        </div>
        <div
          style={{
            background: "rgba(52,211,153,0.15)",
            border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: 99,
            padding: "3px 8px",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399" }}>
            Ready
          </span>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 12,
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 10,
            opacity: 0.4,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Headline metric
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "white", lineHeight: 1.6 }}>
          "{fmt(STATS.confirmedEnrollments)} TCHC tenants enrolled in energy
          support programs in 2025–26, returning{" "}
          <span style={{ color: "#34d399", fontWeight: 700 }}>
            {fmtDollar(STATS.dollarsReturned)}
          </span>{" "}
          to households — enrollment rate up from {STATS.prevEnrollmentRate}% to{" "}
          {STATS.enrollmentRate}%."
        </p>
      </div>

      <button
        style={{
          width: "100%",
          height: 40,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8,
          color: "rgba(255,255,255,0.8)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "inherit",
        }}
        onClick={handleExportReport}
      >
        <Download size={12} /> Export PDF report
      </button>
    </div>
  );
}

// ================================================================
// MAIN DASHBOARD
// ================================================================
export default function TCHCDashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800;9..40,900&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* NAV */}
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/"
            style={{
              display: "flex",
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
          <div style={{ width: 1, height: 16, background: "#e5e7eb" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: "#003B7A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={11} color="white" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
              Toronto Community Housing
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            Last updated: today, 9:42 AM
          </span>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#059669",
            }}
          />
        </div>
      </nav>

      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 60px" }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#111827",
              margin: "0 0 4px",
              letterSpacing: "-0.03em",
            }}
          >
            Energy support dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Tracking energy assistance outcomes across 41,108 TCHC households ·
            2025–26
          </p>
        </div>

        {/* TOP STATS GRID */}
        {/* TOP STATS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <StatCard
            label="Eligibility checks"
            value={fmt(STATS.eligibilityChecks)}
            sub="tenants screened"
            delta="+312 this week"
            accent="#2563eb"
            icon={<Users size={14} color="#2563eb" />}
          />
          <StatCard
            label="Applications started"
            value={fmt(STATS.applicationsStarted)}
            sub="across all programs"
            accent="#7c3aed"
            icon={<TrendingUp size={14} color="#7c3aed" />}
          />
          <StatCard
            label="Confirmed enrollments"
            value={fmt(STATS.confirmedEnrollments)}
            sub="successfully approved"
            delta="+143 this week"
            accent="#059669"
            icon={<Users size={14} color="#059669" />}
          />
          <StatCard
            label="Returned to tenants"
            value={fmtDollar(STATS.dollarsReturned)}
            sub="annual energy support"
            delta="+$77K this week"
            accent="#d97706"
            icon={<DollarSign size={14} color="#d97706" />}
          />
        </div>

        {/* ENROLLMENT RATE + TREND */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <EnrollmentRing
            rate={STATS.enrollmentRate}
            prev={STATS.prevEnrollmentRate}
          />
          <TrendChart data={MONTHLY_DATA} />
        </div>

        {/* PROGRAM BREAKDOWN + CITY REPORT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <ProgramBreakdown />
          <CityReportCard />
        </div>

        {/* BUILDING TABLE */}
        <BuildingTable />

        {/* BOTTOM CALLOUT */}
        <div
          style={{
            marginTop: 16,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 2px",
                fontSize: 13,
                fontWeight: 700,
                color: "#1e40af",
              }}
            >
              3 buildings need attention
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#374151" }}>
              Jamestown, Rexdale Cluster, and Edgeley Village have enrollment
              rates below 35% — direct coordinator outreach recommended.
            </p>
          </div>
          <button
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              background: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              marginLeft: 16,
            }}
          >
            View outreach plan →
          </button>
        </div>
      </div>
    </div>
  );
}
