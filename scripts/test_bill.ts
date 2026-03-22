import {
  getLDCByPostalCode,
  calculateMonthlyBill,
  calculateBillImpact,
} from "../lib/billCalculator";

// look up the LDC for a Toronto postal code
const rate = getLDCByPostalCode("M5V 2T6");
console.log("LDC found:", rate?.ldc);

// make sure the monthly bill calculation comes out right for 700 kWh
if (rate) {
  const bill = calculateMonthlyBill(rate, 700);
  console.log("Monthly bill (700 kWh):", `$${bill}`);
  console.log("Annual bill:", `$${bill * 12}`);
}

// test the full bill impact calculation with some fake programs
const programs = [
  { id: "oesp", annualSaving: 540 },
  { id: "leap", annualSaving: 650 },
] as any;

const impact = calculateBillImpact("M5V 2T6", 700, programs);
console.log("Bill impact:", impact);
