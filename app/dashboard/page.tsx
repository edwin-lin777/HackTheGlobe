"use client";

import { useState } from "react";

const DATA = {
  programs: [
    {
      id: "oesp",
      name: "Ontario Electricity Support Program",
      shortName: "OESP",
      type: "ongoing",
      description:
        "A monthly credit applied directly to your electricity bill automatically.",
      applyUrl: "https://ontarioelectricitysupport.ca",
      annualSaving: 540,
      monthlyCredit: 45,
      status: "not_started",
      howToApply:
        "Apply online at OESP.ca. You will need your electricity account number and SIN of all household members 18+.",
      documents: [
        "Electricity bill (for account number)",
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
        "Cannot apply online. Must call or visit your local LEAP intake agency. See agency card below.",
      documents: [
        "Most recent bill showing amount owing",
        "Proof of income (pay stub, tax return, or OW/ODSP statement)",
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
        "Free home upgrades — smart thermostat, LED bulbs, fridge replacement.",
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
        "Free home weatherization — draft proofing, insulation, smart thermostat.",
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
    annualBill: 1407.54,
    totalAnnualSaving: 1190,
    savingPercentage: 85,
  },
  agency: {
    name: "Toronto Hydro LEAP Intake",
    phone: "211",
    hours: "Mon–Fri 9:00AM–5:00PM",
    onlinePortal:
      "https://www.toronto.ca/community-people/employment-social-support/",
    note: "Call 211 and ask for your nearest LEAP intake agency.",
  },
  alerts: [
    {
      id: "a1",
      title: "OESP income thresholds increased",
      message:
        "Ontario raised OESP eligibility thresholds by 35% in 2024. You may qualify for a higher monthly credit.",
    },
    {
      id: "a2",
      title: "LEAP application not started",
      message:
        "You qualify for up to $650 in emergency bill assistance and haven't started this yet.",
    },
  ],
};

export default function Dashboard() {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(DATA.programs.map((p) => [p.id, p.status])),
  );
  const [dismissed, setDismissed] = useState<string[]>([]);

  const hasLEAP = DATA.programs.some((p) => p.id === "leap");

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "24px 16px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        Your Energy Benefits
      </h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        You qualify for <strong>{DATA.programs.length} programs</strong> —
        potential savings of{" "}
        <strong style={{ color: "green" }}>
          ${DATA.billImpact.totalAnnualSaving}/year
        </strong>
      </p>

      {/* Alerts */}
      {DATA.alerts
        .filter((a) => !dismissed.includes(a.id))
        .map((alert) => (
          <div
            key={alert.id}
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <p style={{ margin: "0 0 2px 0", fontWeight: 700, fontSize: 14 }}>
                🔔 {alert.title}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#444" }}>
                {alert.message}
              </p>
            </div>
            <button
              onClick={() => setDismissed([...dismissed, alert.id])}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                color: "#999",
              }}
            >
              ×
            </button>
          </div>
        ))}

      {/* Savings banner */}
      <div
        style={{
          background: "#0f172a",
          color: "white",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          marginTop: 8,
        }}
      >
        <p style={{ margin: "0 0 4px 0", fontSize: 13, opacity: 0.6 }}>
          {DATA.billImpact.ldcName}
        </p>
        <p style={{ margin: "0 0 12px 0", fontSize: 14, opacity: 0.7 }}>
          Current annual bill:{" "}
          <strong style={{ color: "white" }}>
            ${DATA.billImpact.annualBill}
          </strong>
        </p>
        <p style={{ margin: "0 0 4px 0", fontSize: 13, opacity: 0.6 }}>
          You could save up to
        </p>
        <p
          style={{ margin: 0, fontSize: 48, fontWeight: 900, color: "#34d399" }}
        >
          ${DATA.billImpact.totalAnnualSaving}/yr
        </p>
      </div>

      {/* Program cards */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
        }}
      >
        Programs You Qualify For
      </p>

      {DATA.programs.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "18px 20px",
            marginBottom: 12,
            background: "white",
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
            <span
              style={{
                background: "#f3f4f6",
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {p.shortName}
            </span>
            {p.annualSaving && (
              <span style={{ fontWeight: 900, fontSize: 20, color: "#1d4ed8" }}>
                ${p.annualSaving}/yr
              </span>
            )}
          </div>

          <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 800 }}>
            {p.name}
          </h3>
          <p style={{ margin: "0 0 10px 0", fontSize: 13, color: "#555" }}>
            {p.description}
          </p>

          <p
            style={{
              margin: "0 0 4px 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
            }}
          >
            How to apply
          </p>
          <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#444" }}>
            {p.howToApply}
          </p>

          <p
            style={{
              margin: "0 0 4px 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
            }}
          >
            What to bring
          </p>
          <ul style={{ margin: "0 0 14px 0", paddingLeft: 18 }}>
            {p.documents.map((doc, i) => (
              <li
                key={i}
                style={{ fontSize: 13, color: "#444", marginBottom: 2 }}
              >
                {doc}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.applyUrl && (
              <a
                href={p.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1d4ed8",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Apply Now →
              </a>
            )}
            <select
              value={statuses[p.id]}
              onChange={(e) =>
                setStatuses({ ...statuses, [p.id]: e.target.value })
              }
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 13,
                background: "white",
              }}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted ✓</option>
            </select>
          </div>
        </div>
      ))}

      {/* LEAP agency — only shows if LEAP is in matched programs */}
      {hasLEAP && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 10,
            padding: "18px 20px",
          }}
        >
          <p
            style={{
              margin: "0 0 4px 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#92400e",
              textTransform: "uppercase",
            }}
          >
            📍 Your Nearest LEAP Office
          </p>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 800 }}>
            {DATA.agency.name}
          </h3>
          <p style={{ margin: "0 0 2px 0", fontSize: 14 }}>
            📞 <strong>{DATA.agency.phone}</strong>
          </p>
          <p style={{ margin: "0 0 8px 0", fontSize: 14 }}>
            🕐 {DATA.agency.hours}
          </p>
          <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "#555" }}>
            {DATA.agency.note}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href={`tel:${DATA.agency.phone}`}
              style={{
                background: "#d97706",
                color: "white",
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              📞 Call Now
            </a>
            <a
              href={DATA.agency.onlinePortal}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "white",
                color: "#d97706",
                border: "1px solid #d97706",
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Visit Website
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
