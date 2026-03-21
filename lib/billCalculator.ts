import rates from "@/data/oeb_rates.json";
import type { EligibleProgram } from "./eligibility";

// ================================================================
// POSTAL CODE → LDC MAPPING
// First 3 characters of postal code (FSA) → LDC name
// Covers major Ontario population centres
// Add more as needed
// ================================================================
const FSA_TO_LDC: Record<string, string> = {
  // Toronto
  M4: "Toronto Hydro-Electric System Limited",
  M5: "Toronto Hydro-Electric System Limited",
  M6: "Toronto Hydro-Electric System Limited",
  M1: "Toronto Hydro-Electric System Limited",
  M2: "Toronto Hydro-Electric System Limited",
  M3: "Toronto Hydro-Electric System Limited",
  M7: "Toronto Hydro-Electric System Limited",
  M8: "Toronto Hydro-Electric System Limited",
  M9: "Toronto Hydro-Electric System Limited",

  // Ottawa
  K1: "Hydro Ottawa Limited",
  K2: "Hydro Ottawa Limited",
  K4: "Hydro Ottawa Limited",

  // Kitchener / Waterloo
  N2L: "Enova Power Corp.-Waterloo North Rate Zone",
  N2M: "Enova Power Corp.-Waterloo North Rate Zone",
  N2T: "Enova Power Corp.-Waterloo North Rate Zone",
  N2G: "Enova Power Corp.-Kitchener-Wilmot Hydro Rate Zone",
  N2H: "Enova Power Corp.-Kitchener-Wilmot Hydro Rate Zone",

  // London
  N5: "London Hydro Inc.",
  N6: "London Hydro Inc.",

  // Windsor
  N8: "ENWIN Utilities Ltd.",
  N9: "ENWIN Utilities Ltd.",

  // Burlington
  L7: "Burlington Hydro Inc.",

  // Kingston
  K7: "Kingston Hydro Corporation",

  // Sudbury
  P3: "Greater Sudbury Hydro Inc.",

  // Northern Ontario (Hydro One rural)
  P0: "Hydro One Networks Inc.",
  P1: "Hydro One Networks Inc.",
  P2: "Hydro One Networks Inc.",

  // GTA / Hydro One suburban
  L0: "Hydro One Networks Inc.",
  L1: "Hydro One Networks Inc.",
  L3: "Hydro One Networks Inc.",
  L4: "Hydro One Networks Inc.",
  L6: "Hydro One Networks Inc.",
  L9: "Hydro One Networks Inc.",
};

// ================================================================
// TYPES
// ================================================================
type LDCRate = (typeof rates)[0];

export type BillImpact = {
  ldcName: string;
  monthlyBill: number;
  annualBill: number;
  totalAnnualSaving: number;
  savingPercentage: number;
  programSavings: { programId: string; annualSaving: number }[];
};

// ================================================================
// STEP 1 — Postal code → LDC rate object
// ================================================================
export function getLDCByPostalCode(postalCode: string): LDCRate | null {
  // Normalize — remove spaces, uppercase
  const clean = postalCode.replace(/\s/g, "").toUpperCase();

  // Try 3-char FSA first (most specific)
  const fsa3 = clean.substring(0, 3);
  if (FSA_TO_LDC[fsa3]) {
    const ldcName = FSA_TO_LDC[fsa3];
    return rates.find((r) => r.ldc === ldcName) ?? null;
  }

  // Try 2-char prefix as fallback
  const fsa2 = clean.substring(0, 2);
  if (FSA_TO_LDC[fsa2]) {
    const ldcName = FSA_TO_LDC[fsa2];
    return rates.find((r) => r.ldc === ldcName) ?? null;
  }

  // Default to Hydro One if unknown — covers most rural Ontario
  return rates.find((r) => r.ldc === "Hydro One Networks Inc.") ?? null;
}

// ================================================================
// STEP 2 — Calculate monthly bill from rate data + kWh usage
// Formula: fixed charge + energy cost + distribution + network + connection, all × HST
// ================================================================
export function calculateMonthlyBill(
  rate: LDCRate,
  monthlyKwh: number,
): number {
  const fixedCharge = rate.serviceChargeCents / 100;

  // Tiered energy cost — first 1000 kWh at tier1, rest at tier2
  const tier1Kwh = Math.min(monthlyKwh, rate.tier1Threshold);
  const tier2Kwh = Math.max(0, monthlyKwh - rate.tier1Threshold);
  const energyCost =
    (tier1Kwh * rate.tier1RatePerKwh + tier2Kwh * rate.tier2RatePerKwh) *
    rate.lossFactor;

  const distributionCost = monthlyKwh * rate.distributionChargePerKwh;
  const networkCost = monthlyKwh * rate.networkChargePerKwh;
  const connectionCost = monthlyKwh * rate.connectionChargePerKwh;

  const subtotal =
    fixedCharge + energyCost + distributionCost + networkCost + connectionCost;
  const withHST = subtotal * (1 + rate.hst);

  return Math.round(withHST * 100) / 100; // round to 2 decimal places
}

// ================================================================
// STEP 3 — Full bill impact calculation
// Takes postal code + usage + matched programs
// Returns full breakdown including savings per program
// ================================================================
export function calculateBillImpact(
  postalCode: string,
  monthlyKwh: number,
  eligiblePrograms: EligibleProgram[],
): BillImpact {
  const rate = getLDCByPostalCode(postalCode);

  // Fallback if LDC not found — use provincial average rates
  const effectiveRate = rate ?? {
    ldc: "Ontario Average",
    serviceChargeCents: 38,
    distributionChargePerKwh: 0.001,
    tier1RatePerKwh: 0.12,
    tier2RatePerKwh: 0.142,
    networkChargePerKwh: 0.013,
    connectionChargePerKwh: 0.009,
    lossFactor: 1.04,
    hst: 0.13,
    tier1Threshold: 1000,
    year: 2026,
  };

  const monthlyBill = calculateMonthlyBill(effectiveRate, monthlyKwh);
  const annualBill = Math.round(monthlyBill * 12 * 100) / 100;

  // Build per-program savings list
  const programSavings = eligiblePrograms
    .filter((p) => p.annualSaving !== null)
    .map((p) => ({
      programId: p.id,
      annualSaving: p.annualSaving as number,
    }));

  const totalAnnualSaving = programSavings.reduce(
    (sum, p) => sum + p.annualSaving,
    0,
  );

  const savingPercentage =
    annualBill > 0 ? Math.round((totalAnnualSaving / annualBill) * 100) : 0;

  return {
    ldcName: effectiveRate.ldc,
    monthlyBill,
    annualBill,
    totalAnnualSaving,
    savingPercentage,
    programSavings,
  };
}
