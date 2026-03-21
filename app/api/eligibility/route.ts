import { NextRequest, NextResponse } from "next/server";
import { checkEligibility } from "@/lib/eligibility";
import { calculateBillImpact, getLDCByPostalCode } from "@/lib/billCalculator";
import agencies from "@/data/leap_agencies.json";

// ================================================================
// POST /api/eligibility
// Body: UserProfile
// Returns: matched programs + bill impact + nearest LEAP agency + alerts
// ================================================================
export async function POST(req: NextRequest) {
  try {
    const profile = await req.json();

    // Validate required fields
    if (
      !profile.postalCode ||
      !profile.householdSize ||
      profile.annualIncome === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: postalCode, householdSize, annualIncome",
        },
        { status: 400 },
      );
    }

    // Step 1 — run eligibility check
    const programs = checkEligibility(profile);

    // Step 2 — calculate bill impact
    const billImpact = calculateBillImpact(
      profile.postalCode,
      profile.monthlyKwh ?? 700, // default to 700 kWh if not provided
      programs,
    );

    // Step 3 — find nearest LEAP agency
    // Match by LDC name first, fall back to first agency
    const ldcName = getLDCByPostalCode(profile.postalCode)?.ldc ?? "";
    const agency =
      agencies.find((a) => a.servicesLDCs.includes(ldcName)) ?? agencies[0];

    // Step 4 — build alerts
    // In future this will check against a database of recent program changes
    // For now returns static alerts based on profile
    const alerts = [];

    if (programs.some((p) => p.id === "oesp")) {
      alerts.push({
        id: "oesp_threshold",
        title: "OESP income thresholds increased",
        message:
          "Ontario raised OESP eligibility thresholds by 35% in 2024. You may qualify for a higher monthly credit.",
      });
    }

    if (programs.some((p) => p.id === "leap")) {
      alerts.push({
        id: "leap_reminder",
        title: "LEAP application not started",
        message: `You qualify for up to $${programs.find((p) => p.id === "leap")?.annualSaving} in emergency bill assistance. Contact your agency to apply.`,
      });
    }

    // Return full response
    return NextResponse.json({
      programs,
      billImpact,
      agency,
      alerts,
    });
  } catch (err) {
    console.error("Eligibility API error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
