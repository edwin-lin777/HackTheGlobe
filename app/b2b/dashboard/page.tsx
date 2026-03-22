"use client";

import { useState } from "react";
import Link from "next/link";
import { handleExportReport } from "@/lib/exportReport";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Building,
  Download,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  BarChart2,
  Settings,
  HelpCircle,
  Bell,
  Search,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ================================================================
// DATA
// ================================================================
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

const BUILDING_DATA = [
  { name: "Regent Park", units: 2083, enrolled: 1320, rate: 72 },
  { name: "Lawrence Heights", units: 1490, enrolled: 793, rate: 72 },
  { name: "Alexandra Park", units: 686, enrolled: 392, rate: 68 },
  { name: "Moss Park", units: 714, enrolled: 320, rate: 65 },
  { name: "Don Mount Court", units: 232, enrolled: 110, rate: 61 },
  { name: "Swansea Mews", units: 262, enrolled: 70, rate: 50 },
  { name: "Firgrove", units: 473, enrolled: 84, rate: 40 },
  { name: "Edgeley Village", units: 394, enrolled: 42, rate: 35 },
  { name: "Jamestown", units: 538, enrolled: 39, rate: 30 },
  { name: "Rexdale Cluster", units: 412, enrolled: 20, rate: 20 },
];

const PROGRAM_DATA = [
  { name: "OESP", enrolled: 4200, value: "$2.3M", color: "#0f172a" },
  { name: "EAP", enrolled: 3800, value: "Upgrades", color: "#334155" },
  { name: "LEAP", enrolled: 890, value: "$579K", color: "#64748b" },
  {
    name: "Winterproofing",
    enrolled: 620,
    value: "Upgrades",
    color: "#94a3b8",
  },
  { name: "Home Reno", enrolled: 383, value: "$77K", color: "#cbd5e1" },
  { name: "NOEC", enrolled: 210, value: "$33K", color: "#e2e8f0" },
];

const ACTIONS = [
  {
    priority: "high",
    building: "Rexdale Cluster",
    rate: 20,
    units: 412,
    text: "20% enrollment — schedule coordinator visit",
  },
  {
    priority: "high",
    building: "Follow-up",
    rate: null,
    units: 2309,
    text: "2,309 applications started but not submitted",
  },
  {
    priority: "medium",
    building: "Jamestown",
    rate: 30,
    units: 538,
    text: "30% enrollment — run OESP outreach campaign",
  },
  {
    priority: "medium",
    building: "Edgeley Village",
    rate: 35,
    units: 394,
    text: "35% enrollment — review access barriers",
  },
];

function fmt(n: number) {
  return n.toLocaleString();
}
function fmtDollar(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

// ================================================================
// SIDEBAR
// ================================================================
function Sidebar() {
  const nav = [
    { icon: <LayoutDashboard size={15} />, label: "Dashboard", active: true },
  ];

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid #e5e7eb",
        background: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <img
            src="/logo.png"
            alt="Navi$"
            style={{ height: 32, width: "auto" }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Navi$
          </span>
        </Link>
      </div>

      {/* Org */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Building size={13} color="#64748b" />
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Toronto Community
            </p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
              Housing Corporation
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "8px 12px", flex: 1 }}>
        {nav.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              borderRadius: 6,
              marginBottom: 1,
              background: item.active ? "#f1f5f9" : "transparent",
              cursor: "pointer",
            }}
          >
            <span style={{ color: item.active ? "#0f172a" : "#94a3b8" }}>
              {item.icon}
            </span>
            <span
              style={{
                fontSize: 13,
                color: item.active ? "#0f172a" : "#64748b",
                fontWeight: item.active ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9" }}>
        {[
          { icon: <Settings size={14} />, label: "Settings" },
          { icon: <HelpCircle size={14} />, label: "Help" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              marginBottom: 1,
            }}
          >
            <span style={{ color: "#94a3b8" }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, color: "white", fontWeight: 700 }}>
              TC
            </span>
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#0f172a",
                margin: 0,
              }}
            >
              TCHC Admin
            </p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
              admin@torontohousing.ca
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ================================================================
// STAT CARD — shadcn style
// ================================================================
function StatCard({
  label,
  value,
  delta,
  deltaUp,
  sub,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <p
          style={{ fontSize: 13, color: "#64748b", fontWeight: 500, margin: 0 }}
        >
          {label}
        </p>
        <span style={{ color: "#94a3b8" }}>{icon}</span>
      </div>
      <p
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#0f172a",
          margin: "0 0 4px",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {deltaUp ? (
          <TrendingUp size={12} color="#16a34a" />
        ) : (
          <TrendingDown size={12} color="#dc2626" />
        )}
        <p
          style={{
            fontSize: 11,
            color: deltaUp ? "#16a34a" : "#dc2626",
            margin: 0,
            fontWeight: 500,
          }}
        >
          {delta}
        </p>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}

// ================================================================
// CUSTOM TOOLTIP
// ================================================================
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#0f172a" }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ margin: "2px 0", color: p.color || "#64748b" }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

// ================================================================
// MAIN DASHBOARD
// ================================================================
export default function TCHCDashboard() {
  const [buildingShowAll, setBuildingShowAll] = useState(false);
  const displayed = buildingShowAll ? BUILDING_DATA : BUILDING_DATA.slice(0, 5);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <Sidebar />

      {/* MAIN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* TOP BAR */}
        <header
          style={{
            height: 52,
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "6px 12px",
              width: 220,
            }}
          >
            <Search size={13} color="#94a3b8" />
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Search...</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <Bell size={16} color="#64748b" />
              <div
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#dc2626",
                  border: "1.5px solid white",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              Last updated: today, 9:42 AM
            </div>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#16a34a",
              }}
            />
          </div>
        </header>

        <main style={{ padding: "28px 28px 60px", flex: 1 }}>
          {/* PAGE HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 4px",
                  letterSpacing: "-0.03em",
                }}
              >
                Dashboard
              </h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                Energy assistance outcomes across 41,108 TCHC households · Q1
                2026
              </p>
            </div>
            <button
              onClick={handleExportReport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={14} /> Export report
            </button>
          </div>

          {/* STAT CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="Total Enrollments"
              value="6,103"
              delta="+143 this week"
              deltaUp={true}
              sub="confirmed"
              icon={<Users size={16} />}
            />
            <StatCard
              label="Eligibility Checks"
              value="14,208"
              delta="+312 this week"
              deltaUp={true}
              sub="tenants screened"
              icon={<Activity size={16} />}
            />
            <StatCard
              label="Returned to Tenants"
              value="$3.3M"
              delta="+$77K this week"
              deltaUp={true}
              sub="annual est."
              icon={<DollarSign size={16} />}
            />
            <StatCard
              label="Enrollment Rate"
              value="61%"
              delta="+33pp vs last year"
              deltaUp={true}
              sub="of eligible HH"
              icon={<TrendingUp size={16} />}
            />
          </div>

          {/* AREA CHART + ACTION ITEMS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Area chart */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0f172a",
                      margin: "0 0 2px",
                    }}
                  >
                    Enrollment trend
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    Monthly checks vs confirmed enrollments
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 3,
                        background: "#0f172a",
                        borderRadius: 99,
                        display: "inline-block",
                      }}
                    ></span>{" "}
                    Checks
                  </span>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 3,
                        background: "#94a3b8",
                        borderRadius: 99,
                        display: "inline-block",
                      }}
                    ></span>{" "}
                    Enrolled
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={MONTHLY_DATA}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="checks" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#0f172a"
                        stopOpacity={0.08}
                      />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="enrolled" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={0.12}
                      />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="checks"
                    name="Checks"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fill="url(#checks)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="enrolled"
                    name="Enrolled"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#enrolled)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Action items */}
            {/* Action items */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Action items
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: 99,
                      padding: "2px 8px",
                    }}
                  >
                    {ACTIONS.length} open
                  </span>
                </div>
                <p
                  style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}
                >
                  Requires coordinator attention this week
                </p>
              </div>

              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "16px 1fr 60px",
                  padding: "6px 20px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {["", "Item", "Priority"].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textAlign: i === 2 ? "right" : "left",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {ACTIONS.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "16px 1fr 60px",
                    padding: "11px 20px",
                    alignItems: "flex-start",
                    borderBottom:
                      i < ACTIONS.length - 1 ? "1px solid #f8fafc" : "none",
                    gap: 10,
                  }}
                >
                  {/* Priority dot */}
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      marginTop: 3,
                      flexShrink: 0,
                      background: a.priority === "high" ? "#dc2626" : "#d97706",
                    }}
                  />

                  {/* Text */}
                  <div>
                    <p
                      style={{
                        margin: "0 0 1px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {a.building}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "#64748b",
                        lineHeight: 1.5,
                      }}
                    >
                      {a.text}
                    </p>
                  </div>

                  {/* Priority badge */}
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: a.priority === "high" ? "#dc2626" : "#d97706",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {a.priority === "high" ? "High" : "Med"}
                    </span>
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div
                style={{
                  padding: "10px 20px",
                  background: "#f8fafc",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  Updated today, 9:42 AM
                </span>
                <button
                  style={{
                    background: "none",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 11,
                    color: "#64748b",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  View all →
                </button>
              </div>
            </div>
          </div>

          {/* PROGRAM BAR CHART + BUILDING TABLE */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Program bar chart */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "20px 22px",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: "0 0 2px",
                }}
              >
                Enrollment by program
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>
                Households enrolled per program
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={PROGRAM_DATA}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="enrolled" name="Enrolled" radius={[0, 3, 3, 0]}>
                    {PROGRAM_DATA.map((p, i) => (
                      <Cell key={i} fill={p.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Building table */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "20px 22px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0f172a",
                      margin: "0 0 2px",
                    }}
                  >
                    Building breakdown
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    Enrollment rate by building
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 99,
                    padding: "2px 8px",
                  }}
                >
                  {BUILDING_DATA.length} buildings
                </span>
              </div>

              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px 60px 80px",
                  padding: "6px 22px",
                  background: "#f8fafc",
                  borderTop: "1px solid #f1f5f9",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {["Building", "Units", "Enrolled", "Rate"].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textAlign: i > 0 ? "right" : "left",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {displayed.map((b, i) => {
                const color =
                  b.rate >= 60
                    ? "#16a34a"
                    : b.rate >= 40
                      ? "#d97706"
                      : "#dc2626";
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 60px 60px 80px",
                      padding: "9px 22px",
                      alignItems: "center",
                      borderBottom:
                        i < displayed.length - 1 ? "1px solid #f8fafc" : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#0f172a",
                        fontWeight: 500,
                      }}
                    >
                      {b.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        textAlign: "right",
                      }}
                    >
                      {fmt(b.units)}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#0f172a",
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
                          width: 36,
                          height: 4,
                          background: "#f1f5f9",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${b.rate}%`,
                            height: "100%",
                            background: color,
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color,
                          minWidth: 28,
                          textAlign: "right",
                        }}
                      >
                        {b.rate}%
                      </span>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setBuildingShowAll(!buildingShowAll)}
                style={{
                  width: "100%",
                  padding: "9px 22px",
                  background: "#f8fafc",
                  border: "none",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontFamily: "inherit",
                }}
              >
                {buildingShowAll ? (
                  <>
                    <ChevronUp size={12} /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} /> Show all {BUILDING_DATA.length}{" "}
                    buildings
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CITY COUNCIL CALLOUT */}
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "20px 22px",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#f0fdf4",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={18} color="#16a34a" />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: "0 0 4px",
                }}
              >
                Q1 2026 City Council report — ready to export
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  margin: "0 0 10px",
                  lineHeight: 1.6,
                }}
              >
                <em>
                  "In Q1 2026, TCHC connected <strong>6,103 households</strong>{" "}
                  with provincial energy support programs, returning an
                  estimated <strong>$3.3M annually</strong> to tenant
                  households. Enrollment among eligible households increased
                  from 28% to <strong>61%</strong> — a 33 percentage point
                  improvement over the prior year."
                </em>
              </p>
              <button
                onClick={handleExportReport}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  background: "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Download size={13} /> Download full report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
