import {
  getLDCByPostalCode,
  calculateMonthlyBill,
  calculateBillImpact,
} from "../lib/billCalculator";

// Test 1 — Toronto Hydro lookup
const rate = getLDCByPostalCode("M5V 2T6");
console.log("LDC found:", rate?.ldc);

// Test 2 — monthly bill calculation
if (rate) {
  const bill = calculateMonthlyBill(rate, 700);
  console.log("Monthly bill (700 kWh):", `$${bill}`);
  console.log("Annual bill:", `$${bill * 12}`);
}

// Test 3 — full impact with dummy programs
const programs = [
  { id: "oesp", annualSaving: 540 },
  { id: "leap", annualSaving: 650 },
] as any;

const impact = calculateBillImpact("M5V 2T6", 700, programs);
console.log("Bill impact:", impact);
