import { NextRequest, NextResponse } from "next/server";
import { checkEligibility, type UserProfile } from "@/lib/eligibility";
import { calculateBillImpact, getLDCByPostalCode } from "@/lib/billCalculator";
import agencies from "@/data/leap_agencies.json";

// POST /api/eligibility — runs the full eligibility pipeline and returns everything the client needs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // bail early if anything critical is missing
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

    // coerce the raw body into a properly typed profile
    const profile: UserProfile = {
      postalCode: String(body.postalCode),
      householdSize: Number(body.householdSize),
      annualIncome: Number(body.annualIncome),
      hasArrears: !!body.hasArrears,
      isElectricHeat: !!body.isElectricHeat,
      isEnbridgeCustomer: !!body.isEnbridgeCustomer,
      isNorthernOntario: !!body.isNorthernOntario,
      isOWSP: !!body.isOWSP,
      monthlyKwh:
        body.monthlyKwh !== undefined && body.monthlyKwh !== null
          ? Number(body.monthlyKwh)
          : 700, // default if not provided
    };

    // check which programs this person qualifies for
    const programs = checkEligibility(profile);

    // estimate their current bill and total savings across matched programs
    const billImpact = calculateBillImpact(
      profile.postalCode,
      profile.monthlyKwh,
      programs,
    );

    // find the LEAP agency that serves their local utility
    const ldcName = getLDCByPostalCode(profile.postalCode)?.ldc ?? "";
    const agency =
      agencies.find((a) => a.servicesLDCs.includes(ldcName)) ?? agencies[0];

    // flag anything time-sensitive they should know about
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
      // echoing profile back so the client can use it for prefilling etc.
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
