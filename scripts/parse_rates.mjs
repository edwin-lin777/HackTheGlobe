import { XMLParser } from "fast-xml-parser";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OEB_URL = "https://www.oeb.ca/_html/calculator/data/BillData.xml";
const LOCAL_FALLBACK = resolve(__dirname, "../data/BillData.xml");

async function getXML() {
  if (existsSync(LOCAL_FALLBACK)) {
    console.log("Using local BillData.xml...");
    return readFileSync(LOCAL_FALLBACK, "utf-8");
  }
  console.log("Fetching live from OEB...");
  const res = await fetch(OEB_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return res.text();
}

async function parseRates() {
  const xml = await getXML();
  const parser = new XMLParser();
  const parsed = parser.parse(xml);
  const rows = parsed.BillDataTable.BillDataRow;

  const residential = rows.filter((row) => {
    const cls = (row.Class || "").toString().trim().toUpperCase();
    return cls === "RESIDENTIAL";
  });

  const rates = residential.map((row) => ({
    ldc: row.Dist.trim(),
    serviceChargeCents: parseFloat(row.SC) || 0,
    distributionChargePerKwh: parseFloat(row.DC) || 0,
    tier1RatePerKwh: parseFloat(row.RPP1) || 0.12,
    tier2RatePerKwh: parseFloat(row.RPP2) || 0.142,
    networkChargePerKwh: parseFloat(row.Net) || 0,
    connectionChargePerKwh: parseFloat(row.Conn) || 0,
    lossFactor: parseFloat(row.LF) || 1,
    hst: parseFloat(row.GST) || 0.13,
    tier1Threshold: parseInt(row.ET1) || 1000,
    year: parseInt(row.YEAR),
  }));

  console.log(`Parsed ${rates.length} residential LDCs`);
  const outPath = resolve(__dirname, "../data/oeb_rates.json");
  writeFileSync(outPath, JSON.stringify(rates, null, 2));
  console.log(`Saved to data/oeb_rates.json`);

  const sample = rates.find((r) => r.ldc.includes("Toronto Hydro"));
  if (sample) {
    console.log("\nSample — Toronto Hydro:");
    console.log(JSON.stringify(sample, null, 2));
  }
}

parseRates().catch(console.error);
