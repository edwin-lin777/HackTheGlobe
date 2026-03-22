import programs from "@/data/programs.json";

// everything the onboarding form collects from the user
export type UserProfile = {
  postalCode: string;
  householdSize: number;
  annualIncome: number;
  hasArrears: boolean;
  isElectricHeat: boolean;
  isEnbridgeCustomer: boolean;
  isNorthernOntario: boolean;
  isOWSP: boolean; // true if they're on Ontario Works or ODSP
  monthlyKwh: number;
};

// one entry per matched program returned from checkEligibility
export type EligibleProgram = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  description: string;
  applyUrl: string | null;
  annualSaving: number | null;
  monthlyCredit: number | null;
  status: "not_started";
  howToApply: string;
  documents: string[];
};

// finds the income threshold for a given household size
// returns null if the household size isn't in the table, which we treat as ineligible
function getIncomeThreshold(
  thresholds: { householdSize: number; maxIncome: number }[],
  householdSize: number
): number | null {
  // if the household is bigger than anything in the table, just use the largest entry
  const sorted = [...thresholds].sort((a, b) => b.householdSize - a.householdSize);
  const match = sorted.find((t) => t.householdSize <= householdSize);
  return match ? match.maxIncome : null;
}

// looks up the monthly OESP credit for a given household size
function getOESPCredit(
  benefits: { householdSize: number; maxIncome: number; monthlyCredit: number }[],
  householdSize: number
): number {
  const sorted = [...benefits].sort((a, b) => b.householdSize - a.householdSize);
  const match = sorted.find((b) => b.householdSize <= householdSize);
  return match ? match.monthlyCredit : 35; // fall back to the lowest tier if nothing matches
}

// returns the list of documents a person needs to gather for a given program
function getDocuments(programId: string, profile: UserProfile): string[] {
  switch (programId) {
    case "oesp":
      return [
        "Electricity bill (for your account number)",
        "SIN for all household members 18+",
        "Names and birthdates of everyone in the home",
      ];
    case "leap":
      return [
        "Most recent electricity or gas bill showing amount owing",
        "Proof of income (pay stub, tax return, or OW/ODSP statement)",
        "Government-issued ID",
        "Proof of address (utility bill or lease)",
      ];
    case "eap":
      return ["Proof of OESP enrollment (received after OESP is approved)"];
    case "enbridge_winterproofing":
      return ["Enbridge Gas account number (on your gas bill)", "Proof of income"];
    case "noec":
      return ["File your annual tax return and complete the ON-BEN form"];
    case "home_renovation_savings":
      return ["Electricity or gas account number", "Proof of residence"];
    default:
      return [];
  }
}

// returns plain-language application instructions for each program
function getHowToApply(programId: string): string {
  switch (programId) {
    case "oesp":
      return "Apply online at OESP.ca in about 10 minutes. You will need your electricity account number and the SIN of everyone in your household aged 18+.";
    case "leap":
      return "Cannot apply online. You must call or visit your local LEAP intake agency. See the agency card for your nearest office, phone number and hours.";
    case "eap":
      return "Apply at SaveOnEnergy.ca. You automatically qualify because you are eligible for OESP — no additional income check needed.";
    case "enbridge_winterproofing":
      return "Apply at enbridgegas.com/home-winterproofing. You qualify because you are an Enbridge Gas customer with income below the threshold.";
    case "noec":
      return "No separate application needed. Complete the ON-BEN form as part of your annual Ontario tax return to receive this credit.";
    case "home_renovation_savings":
      return "Apply at ontario.ca/page/home-renovation-savings-program. Available to all residential electricity and natural gas customers.";
    default:
      return "";
  }
}

// runs through every program and returns the ones the user qualifies for
export function checkEligibility(profile: UserProfile): EligibleProgram[] {
  const results: EligibleProgram[] = [];
  let oespEligible = false;

  for (const program of programs) {
    let eligible = false;
    let annualSaving: number | null = null;
    let monthlyCredit: number | null = null;

    // OESP: income + household size check, OW/ODSP recipients qualify automatically
    if (program.id === "oesp") {
      if (profile.isOWSP) {
        eligible = true;
      } else {
        const thresholds = (program.eligibility as any).incomeThresholds;
        const maxIncome = getIncomeThreshold(thresholds, profile.householdSize);
        eligible = maxIncome !== null && profile.annualIncome <= maxIncome;
      }

      if (eligible) {
        oespEligible = true;
        const benefitTable = program.benefits as { householdSize: number; maxIncome: number; monthlyCredit: number }[];
        monthlyCredit = getOESPCredit(benefitTable, profile.householdSize);

        // electric heat households get a bump on top of the base credit
        if (profile.isElectricHeat) {
          monthlyCredit = Math.min(monthlyCredit + 20, 113);
        }

        annualSaving = monthlyCredit * 12;
      }
    }

    // LEAP: income check + must have arrears, and can't already be getting OESP
    else if (program.id === "leap") {
      const thresholds = (program.eligibility as any).incomeThresholds;
      const maxIncome = getIncomeThreshold(thresholds, profile.householdSize);
      const incomeEligible = maxIncome !== null && profile.annualIncome <= maxIncome;

      eligible = incomeEligible && profile.hasArrears && !oespEligible;

      if (eligible) {
        annualSaving = profile.isElectricHeat
          ? (program.benefits as any).electricityHeatedMaxGrant
          : (program.benefits as any).electricityMaxGrant;
      }
    }

    // EAP: if they qualify for OESP, they automatically get this too
    else if (program.id === "eap") {
      eligible = oespEligible;
      // benefit is free physical upgrades, not a dollar credit
    }

    // Enbridge Winterproofing: must be an Enbridge customer and income-qualified
    else if (program.id === "enbridge_winterproofing") {
      const thresholds = [
        { householdSize: 1, maxIncome: 28000 },
        { householdSize: 2, maxIncome: 39000 },
        { householdSize: 3, maxIncome: 48000 },
        { householdSize: 4, maxIncome: 65000 },
        { householdSize: 6, maxIncome: 82000 },
      ];
      const maxIncome = getIncomeThreshold(thresholds, profile.householdSize);
      eligible =
        profile.isEnbridgeCustomer &&
        maxIncome !== null &&
        profile.annualIncome <= maxIncome;
    }

    // Northern Ontario Energy Credit: only available to Northern ON residents
    else if (program.id === "noec") {
      eligible = profile.isNorthernOntario;
    }

    // Home Renovation Savings: open to everyone, no income check needed
    
    else if (program.id === "home_renovation_savings") {
      eligible = true;
    }

    // add to results if they passed the check above
    if (eligible) {
      results.push({
        id: program.id,
        name: program.name,
        shortName: program.shortName,
        type: program.type,
        description: program.description,
        applyUrl: program.applyUrl ?? null,
        annualSaving,
        monthlyCredit,
        status: "not_started",
        howToApply: getHowToApply(program.id),
        documents: getDocuments(program.id, profile),
      });
    }
  }

  return results;
}