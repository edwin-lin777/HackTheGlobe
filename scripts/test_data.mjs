import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (file) => JSON.parse(readFileSync(resolve(__dirname, "../data", file), "utf-8"));

// Load all three files
const rates = read("oeb_rates.json");
const programs = read("programs.json");
const agencies = read("leap_agencies.json");

// Test 1: rates file
console.log("=== RATES ===");
console.log(`Total LDCs: ${rates.length}`);
const toronto = rates.find(r => r.ldc.includes("Toronto Hydro"));
console.log("Toronto Hydro found:", !!toronto);
console.log("Toronto service charge:", toronto?.serviceChargeCents, "cents/month");

// Test 2: programs file
console.log("\n=== PROGRAMS ===");
console.log(`Total programs: ${programs.length}`);
programs.forEach(p => console.log(`- ${p.id}: ${p.name}`));

// Test 3: agencies file
console.log("\n=== AGENCIES ===");
console.log(`Total agencies: ${agencies.length}`);
agencies.forEach(a => console.log(`- ${a.name} | ${a.phone}`));

// Test 4: simple bill calculation for Toronto Hydro, 700 kWh/month
console.log("\n=== BILL CALC SAMPLE ===");
const r = toronto;
const kwh = 700;
const energyCost = kwh * r.tier1RatePerKwh * r.lossFactor;
const distCost = kwh * r.distributionChargePerKwh;
const networkCost = kwh * r.networkChargePerKwh;
const connCost = kwh * r.connectionChargePerKwh;
const fixedCost = r.serviceChargeCents / 100;
const subtotal = energyCost + distCost + networkCost + connCost + fixedCost;
const monthly = subtotal * (1 + r.hst);
const annual = monthly * 12;
console.log(`Monthly bill (700 kWh, Toronto Hydro): $${monthly.toFixed(2)}`);
console.log(`Annual bill: $${annual.toFixed(2)}`);

// Test 5: OESP benefit for household of 2, income $35k
const oesp = programs.find(p => p.id === "oesp");
const hSize = 2;
const income = 35000;
const threshold = oesp.eligibility.incomeThresholds.find(t => t.householdSize === hSize);
const eligible = income <= threshold.maxIncome;
const benefit = oesp.benefits.find(b => b.householdSize === hSize);
console.log(`\nOESP eligible (2 people, $35k income): ${eligible}`);
console.log(`Monthly credit: $${benefit.monthlyCredit}`);
console.log(`Annual savings: $${benefit.monthlyCredit * 12}`);