import { NextRequest, NextResponse } from "next/server";
import { checkEligibility, type UserProfile } from "@/lib/eligibility";
import { calculateBillImpact, getLDCByPostalCode } from "@/lib/billCalculator";
import agencies from "@/data/leap_agencies.json";

// ================================================================
// POST /api/eligibility
// Body: form payload
// Returns: matched programs + bill impact + nearest LEAP agency + alerts
// ================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields from body
    if (
      !body.postalCode ||
      !body.householdSize ||
      body.annualIncome === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: postalCode, householdSize, annualIncome",
        },
        { status: 400 },
      );
    }

    // Build a clean UserProfile with correct names / types
    const profile: UserProfile = {
      postalCode: String(body.postalCode),
      householdSize: Number(body.householdSize),
      annualIncome: Number(body.annualIncome),
      hasArrears: !!body.hasArrears,
      isElectricHeat: !!body.isHeatedElectric,
      isEnbridgeCustomer: !!body.hasEnbridge,
      // map from frontend checkbox livesInNorthernOntario
      isNorthernOntario: !!body.livesInNorthernOntario,
      // map from frontend onOwOrOdsp
      isOWSP: !!body.onOwOrOdsp,
      monthlyKwh:
        body.monthlyKwh !== undefined && body.monthlyKwh !== null
          ? Number(body.monthlyKwh)
          : 700, // default if not provided
    };

    // Step 1 — run eligibility check
    const programs = checkEligibility(profile);

    // Step 2 — calculate bill impact
    const billImpact = calculateBillImpact(
      profile.postalCode,
      profile.monthlyKwh,
      programs,
    );

    // Step 3 — find nearest LEAP agency
    const ldcName = getLDCByPostalCode(profile.postalCode)?.ldc ?? "";
    const agency =
      agencies.find((a) => a.servicesLDCs.includes(ldcName)) ?? agencies[0];

    // Step 4 — build alerts
    const alerts: { id: string; title: string; message: string }[] = [];

    if (programs.some((p) => p.id === "oesp")) {
      alerts.push({
        id: "oesp_threshold",
        title: "OESP income thresholds increased",
        message:
          "Ontario raised OESP eligibility thresholds by 35% in 2024. You may qualify for a higher monthly credit.",
      });
    }

    if (programs.some((p) => p.id === "leap")) {
      const leapProgram = programs.find((p) => p.id === "leap");
      alerts.push({
        id: "leap_reminder",
        title: "LEAP application not started",
        message: `You qualify for up to $${leapProgram?.annualSaving} in emergency bill assistance. Contact your agency to apply.`,
      });
    }

    return NextResponse.json({
      programs,
      billImpact,
      agency,
      alerts,
      // optional: echo profile back if you want it on the client
      profile,
    });
  } catch (err) {
    console.error("Eligibility API error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
