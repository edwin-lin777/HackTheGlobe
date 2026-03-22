// generates and opens a printable HTML report for the TCHC energy support data

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

const MONTHLY_DATA = [
  { month: "Jul", enrolled: 310 },
  { month: "Aug", enrolled: 390 },
  { month: "Sep", enrolled: 480 },
  { month: "Oct", enrolled: 590 },
  { month: "Nov", enrolled: 720 },
  { month: "Dec", enrolled: 650 },
  { month: "Jan", enrolled: 810 },
  { month: "Feb", enrolled: 920 },
  { month: "Mar", enrolled: 1100 },
  { month: "Apr", enrolled: 1133 },
];

const PROGRAM_DATA = [
  { name: "OESP", enrolled: 4200, color: "#1a1a1a" },
  { name: "EAP", enrolled: 3800, color: "#555555" },
  { name: "LEAP", enrolled: 890, color: "#888888" },
  { name: "Winterproofing", enrolled: 620, color: "#aaaaaa" },
  { name: "Home Reno", enrolled: 383, color: "#cccccc" },
  { name: "NOEC", enrolled: 210, color: "#e0e0e0" },
];

export function handleExportReport() {
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const rateColor = (r: number) =>
    r >= 60 ? "#1a5c32" : r >= 40 ? "#7a4a00" : "#8b0000";
  const rateLabel = (r: number) =>
    r >= 60 ? "On track" : r >= 40 ? "Monitor" : "Action required";

  // build the monthly enrollment bar chart as inline SVG
  const maxEnrolled = Math.max(...MONTHLY_DATA.map((d) => d.enrolled));
  const chartH = 80;
  const barW = 22;
  const barGap = 7;
  const chartW = MONTHLY_DATA.length * (barW + barGap) - barGap;
  const bars = MONTHLY_DATA.map((d, i) => {
    const bH = Math.round((d.enrolled / maxEnrolled) * chartH);
    const x = i * (barW + barGap);
    const y = chartH - bH;
    const isQ1 = ["Jan", "Feb", "Mar", "Apr"].includes(d.month);
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${bH}" fill="${isQ1 ? "#1a1a1a" : "#cccccc"}" rx="2"/>
      <text x="${x + barW / 2}" y="${chartH + 10}" text-anchor="middle" font-size="6.5" fill="#888" font-family="Arial">${d.month}</text>
    `;
  }).join("");

  // build the program breakdown donut chart as inline SVG
  const total = PROGRAM_DATA.reduce((s, p) => s + p.enrolled, 0);
  const cx = 70;
  const cy = 70;
  const R = 55;
  const r = 34;
  let angle = -Math.PI / 2;
  const slices = PROGRAM_DATA.map((p) => {
    const sweep = (p.enrolled / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle);
    const y2 = cy + R * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const ix1 = cx + r * Math.cos(angle - sweep);
    const iy1 = cy + r * Math.sin(angle - sweep);
    const ix2 = cx + r * Math.cos(angle);
    const iy2 = cy + r * Math.sin(angle);
    const pct = Math.round((p.enrolled / total) * 100);
    return {
      x1,
      y1,
      x2,
      y2,
      ix1,
      iy1,
      ix2,
      iy2,
      large,
      color: p.color,
      name: p.name,
      pct,
      sweep,
    };
  });

  const donutSlices = slices
    .map(
      (s) => `
    <path d="M ${s.x1} ${s.y1} A ${R} ${R} 0 ${s.large} 1 ${s.x2} ${s.y2}
             L ${s.ix2} ${s.iy2} A ${r} ${r} 0 ${s.large} 0 ${s.ix1} ${s.iy1} Z"
      fill="${s.color}" stroke="white" stroke-width="1.5"/>
  `,
    )
    .join("");

  const donutCenter = `
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="10" font-family="Arial" font-weight="bold" fill="#1a1a1a">6,103</text>
    <text x="${cx}" y="${cy + 9}" text-anchor="middle" font-size="6.5" font-family="Arial" fill="#888">enrolled</text>
  `;

  const legendHTML = PROGRAM_DATA.map(
    (p) => `
    <div style="display:flex;align-items:center;gap:5pt;margin-bottom:4pt;">
      <div style="width:9px;height:9px;background:${p.color};border-radius:1px;flex-shrink:0;border:1px solid #ddd"></div>
      <span style="color:#333;flex:1">${p.name}</span>
      <span style="color:#888;font-weight:bold">${Math.round((p.enrolled / total) * 100)}%</span>
    </div>
  `,
  ).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>TCHC — Energy Support Report Q1 2026</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, sans-serif;
    color: #1a1a1a; background: white;
    font-size: 9.5pt; line-height: 1.5;
    padding: 32pt 44pt;
    max-width: 720px; margin: 0 auto;
  }
  .header {
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 10pt; margin-bottom: 14pt;
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .header h1 { font-size: 15pt; font-weight: bold; letter-spacing: -0.02em; margin-bottom: 2pt; }
  .header-sub { font-size: 8pt; color: #666; }
  .header-right { font-size: 7.5pt; color: #888; text-align: right; line-height: 1.6; }

  .callout {
    border-left: 3px solid #1a1a1a; background: #f7f7f7;
    padding: 9pt 13pt; margin-bottom: 14pt;
  }
  .callout-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 4pt; }
  .callout p { font-size: 9.5pt; line-height: 1.7; }

  .metrics {
    display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
    border: 1px solid #ccc; margin-bottom: 14pt;
  }
  .metric { padding: 9pt 11pt; border-right: 1px solid #ccc; }
  .metric:last-child { border-right: none; }
  .metric-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 3pt; }
  .metric-value { font-size: 18pt; font-weight: bold; letter-spacing: -0.02em; line-height: 1; margin-bottom: 2pt; }
  .metric-sub { font-size: 7.5pt; color: #666; }
  .metric-delta { font-size: 7.5pt; color: #1a5c32; font-weight: bold; margin-top: 3pt; }

  .section-label {
    font-size: 7pt; text-transform: uppercase; letter-spacing: 0.1em; color: #888;
    border-bottom: 1px solid #ccc; padding-bottom: 3pt; margin-bottom: 8pt;
  }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18pt; margin-bottom: 14pt; }

  .chart-row {
    display: grid; grid-template-columns: 220px 1fr;
    gap: 18pt; margin-bottom: 14pt;
    border: 1px solid #e8e8e8; padding: 10pt 12pt;
  }

  table { width: 100%; border-collapse: collapse; font-size: 8pt; }
  thead tr { border-top: 1.5px solid #1a1a1a; border-bottom: 1px solid #1a1a1a; }
  th { padding: 4pt 7pt; text-align: left; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.06em; color: #555; }
  td { padding: 4pt 7pt; border-bottom: 1px solid #ebebeb; }
  tfoot tr { border-top: 1.5px solid #1a1a1a; }
  tfoot td { font-weight: bold; padding: 4pt 7pt; }

  .chart-legend { display: flex; gap: 12pt; margin-bottom: 6pt; align-items: center; }
  .legend-item { display: flex; align-items: center; gap: 4pt; font-size: 7.5pt; color: #666; }
  .legend-swatch-dark  { width: 10px; height: 8px; background: #1a1a1a; border-radius: 1px; }
  .legend-swatch-light { width: 10px; height: 8px; background: #ccc; border-radius: 1px; }

  .footer {
    border-top: 1px solid #ccc; padding-top: 7pt; margin-top: 14pt;
    display: flex; justify-content: space-between;
    font-size: 7pt; color: #aaa;
  }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>

  <!-- page header with title and generated date -->
  <div class="header">
    <div>
      <h1>Energy Support Outcomes — Q1 2026</h1>
      <div class="header-sub">Toronto Community Housing Corporation &nbsp;·&nbsp; Prepared by Navi$</div>
    </div>
    <div class="header-right">Generated ${today}<br/>v1.2 — Draft, internal use only</div>
  </div>

  <!-- recommended language block for city council affordability reporting -->
  <div class="callout">
    <div class="callout-label">Recommended language — City Council affordability mandate reporting</div>
    <p>"In Q1 2026, TCHC connected <strong>6,103 households</strong> with provincial energy support programs, returning an estimated <strong>$3.3M annually</strong> to tenant households. Enrollment among eligible households increased from 28% to <strong>61%</strong> — a 33 percentage point improvement over the prior year."</p>
  </div>

  <!-- four key metrics across the top -->
  <div class="metrics">
    <div class="metric">
      <div class="metric-label">Eligibility checks</div>
      <div class="metric-value">14,208</div>
      <div class="metric-sub">Tenants screened</div>
      <div class="metric-delta">↑ +312 this week</div>
    </div>
    <div class="metric">
      <div class="metric-label">Applications started</div>
      <div class="metric-value">8,412</div>
      <div class="metric-sub">Across all programs</div>
    </div>
    <div class="metric">
      <div class="metric-label">Confirmed enrollments</div>
      <div class="metric-value">6,103</div>
      <div class="metric-sub">Successfully approved</div>
      <div class="metric-delta">↑ +143 this week</div>
    </div>
    <div class="metric">
      <div class="metric-label">Returned to tenants</div>
      <div class="metric-value">$3.3M</div>
      <div class="metric-sub">Est. annual value</div>
      <div class="metric-delta">↑ +$77K this week</div>
    </div>
  </div>

  <!-- program breakdown and per-building enrollment rate tables -->
  <div class="two-col">
    <div>
      <div class="section-label">Program breakdown</div>
      <table>
        <thead><tr><th>Program</th><th style="text-align:right">HH</th><th style="text-align:right">Value</th></tr></thead>
        <tbody>
          <tr><td>OESP</td><td style="text-align:right">4,200</td><td style="text-align:right">$2.3M</td></tr>
          <tr><td>LEAP</td><td style="text-align:right">890</td><td style="text-align:right">$579K</td></tr>
          <tr><td>EAP</td><td style="text-align:right">3,800</td><td style="text-align:right">Upgrades</td></tr>
          <tr><td>Winterproofing</td><td style="text-align:right">620</td><td style="text-align:right">Upgrades</td></tr>
          <tr><td>NOEC</td><td style="text-align:right">210</td><td style="text-align:right">$33K</td></tr>
          <tr><td>Home Reno</td><td style="text-align:right">383</td><td style="text-align:right">$77K</td></tr>
        </tbody>
        <tfoot><tr><td>Total</td><td style="text-align:right">6,103</td><td style="text-align:right">$3.3M+</td></tr></tfoot>
      </table>
    </div>
    <div>
      <div class="section-label">Building enrollment rates</div>
      <table>
        <thead><tr><th>Building</th><th style="text-align:right">Rate</th><th>Status</th></tr></thead>
        <tbody>
          ${BUILDING_DATA.map(
            (b) => `
          <tr>
            <td>${b.name}</td>
            <td style="text-align:right;font-weight:bold;color:${rateColor(b.rate)}">${b.rate}%</td>
            <td style="color:${rateColor(b.rate)};font-size:7.5pt">${rateLabel(b.rate)}</td>
          </tr>`,
          ).join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- donut and bar chart sitting side by side -->
  <div class="chart-row">

    <!-- enrollment by program donut -->
    <div>
      <div class="section-label" style="margin-bottom:8pt">Enrollment by program</div>
      <div style="display:flex;align-items:center;gap:14pt;">
        <svg width="110" height="110" viewBox="0 0 140 140" style="flex-shrink:0">
          ${donutSlices}
          ${donutCenter}
        </svg>
        <div style="font-size:7.5pt;font-family:Arial;flex:1">
          ${legendHTML}
        </div>
      </div>
    </div>

    <!-- monthly enrollment trend bar chart -->
    <div>
      <div class="section-label" style="margin-bottom:8pt">Monthly enrollments</div>
      <div class="chart-legend">
        <div class="legend-item"><div class="legend-swatch-dark"></div> Q1 2026</div>
        <div class="legend-item"><div class="legend-swatch-light"></div> Prior months</div>
      </div>
      <svg width="100%" viewBox="0 0 ${chartW} ${chartH + 16}" style="display:block;width:100%">
        ${bars}
      </svg>
    </div>

  </div>

  <!-- footer with org name and report date -->
  <div class="footer">
    <span>Toronto Community Housing Corporation &nbsp;·&nbsp; Q1 2026 &nbsp;·&nbsp; Internal Use Only</span>
    <span>SubsidyAccess &nbsp;·&nbsp; subsidyaccess.ca</span>
  </div>

</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  }
}
