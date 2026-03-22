import { checkEligibility } from "../lib/eligibility";

// income-qualified Toronto household with Enbridge — should get OESP, EAP, Enbridge winterproofing
const profile1 = {
  postalCode: "M5V 2T6",
  householdSize: 2,
  annualIncome: 35000,
  hasArrears: false,
  isElectricHeat: false,
  isEnbridgeCustomer: true,
  isNorthernOntario: false,
  isOWSP: false,
  monthlyKwh: 700,
};

// higher income with arrears — should get LEAP but not OESP
const profile2 = {
  postalCode: "M5V 2T6",
  householdSize: 4,
  annualIncome: 60000,
  hasArrears: true,
  isElectricHeat: true,
  isEnbridgeCustomer: false,
  isNorthernOntario: false,
  isOWSP: false,
  monthlyKwh: 700,
};

// Northern Ontario resident — should get NOEC on top of OESP and EAP
const profile3 = {
  postalCode: "P3A 1B2",
  householdSize: 1,
  annualIncome: 25000,
  hasArrears: false,
  isElectricHeat: true,
  isEnbridgeCustomer: false,
  isNorthernOntario: true,
  isOWSP: false,
  monthlyKwh: 700,
};

console.log("=== Profile 1 (should get OESP, EAP, Enbridge) ===");
console.log(checkEligibility(profile1).map(p => `${p.shortName} — $${p.annualSaving ?? "free upgrades"}`));

console.log("\n=== Profile 2 (should get LEAP, home reno) ===");
console.log(checkEligibility(profile2).map(p => `${p.shortName} — $${p.annualSaving ?? "free upgrades"}`));

console.log("\n=== Profile 3 (should get OESP, EAP, NOEC) ===");
console.log(checkEligibility(profile3).map(p => `${p.shortName} — $${p.annualSaving ?? "free upgrades"}`));