"use client";

import { useEffect, useState } from "react";

const ALL_PROGRAM_IDS = [
  "oesp",
  "leap",
  "eap",
  "enbridge_winterproofing",
  "noec",
  "home_renovation_savings",
];

const PROGRAM_LABELS: Record<string, string> = {
  oesp: "Ontario Electricity Support Program",
  leap: "Low-income Energy Assistance Program",
  eap: "Energy Affordability Program",
  enbridge_winterproofing: "Enbridge Home Winterproofing Program",
  noec: "Northern Ontario Energy Credit",
  home_renovation_savings: "Home Renovation Savings Program",
};

type AnswersFlags = {
  hasArrears: boolean;
  isHeatedElectric: boolean;
  isEnbridgeCustomer: boolean;
  isNorthernOntario: boolean;
  isOWSP: boolean;
};

function reasonForIneligibility(id: string, a: AnswersFlags): string {
  switch (id) {
    case "oesp":
      if (!a.isOWSP) {
        return "Your income is above the limit for your household size, or you are not on Ontario Works or ODSP.";
      }
      return "You do not meet the income or benefit rules for OESP.";
    case "leap":
      if (!a.hasArrears) {
        return "LEAP is for people who are behind on their electricity or gas bill.";
      }
      return "You may not meet LEAP’s income rules, or you already qualify for OESP.";
    case "eap":
      return "You are not eligible for OESP, so you do not automatically qualify for the Energy Affordability Program.";
    case "enbridge_winterproofing":
      if (!a.isEnbridgeCustomer) {
        return "This program is only for Enbridge Gas customers.";
      }
      return "Your income is above the limit for the Enbridge Home Winterproofing Program.";
    case "noec":
      return "The Northern Ontario Energy Credit is only for people living in Northern Ontario.";
    case "home_renovation_savings":
      return "This program is generally available, but we could not match it based on your answers.";
    default:
      return "Based on your answers, this program is not a match right now.";
  }
}

export default function DashboardPage() {
  const [eligible, setEligible] = useState<any[]>([]);
  const [ineligibleIds, setIneligibleIds] = useState<string[]>([]);
  const [flags, setFlags] = useState<AnswersFlags | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("eligibilityResult");
    if (!raw) return;
    const data = JSON.parse(raw);

    const programs = Array.isArray(data.programs) ? data.programs : [];
    setEligible(programs);

    const matchedIds = new Set(programs.map((p: any) => p.id));
    const notMatched = ALL_PROGRAM_IDS.filter((id) => !matchedIds.has(id));
    setIneligibleIds(notMatched);

    // pull flags from the original profile if your backend echoed it back;
    // fall back to false if not present
    setFlags({
      hasArrears: Boolean(data.profile?.hasArrears),
      isHeatedElectric: Boolean(data.profile?.isElectricHeat),
      isEnbridgeCustomer: Boolean(data.profile?.isEnbridgeCustomer),
      isNorthernOntario: Boolean(data.profile?.isNorthernOntario),
      isOWSP: Boolean(data.profile?.isOWSP),
    });
  }, []);

  if (!eligible.length && !ineligibleIds.length) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-50">
          Your energy supports
        </h1>
        <p className="text-slate-200">
          We could not find your answers. Please start the eligibility check
          again.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-50">
        Your energy supports
      </h1>

      {/* Eligible programs in a grid */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-slate-50">
          You may be eligible for:
        </h2>

        {eligible.length === 0 ? (
          <p className="text-lg text-slate-200">
            Based on your answers, we did not find any programs that are a strong
            match right now.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eligible.map((program) => (
              <article
                key={program.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div>
                  <h3 className="text-xl font-semibold text-slate-50">
                    {program.name}
                  </h3>
                  {program.monthlyCredit && (
                    <p className="mt-2 text-sm text-yellow-300">
                      Estimated monthly credit: ${program.monthlyCredit}
                    </p>
                  )}
                  {program.annualSaving && (
                    <p className="mt-1 text-sm text-yellow-300">
                      Estimated yearly support: ${program.annualSaving}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-slate-200">
                    {program.description}
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    {program.howToApply}
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-yellow-400 px-4 py-2 text-base font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Apply
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Not-eligible programs with reasons */}
      <section>
        <h2 className="mb-3 text-2xl font-bold text-slate-50">
          Programs that are not a match right now
        </h2>
        <p className="mb-4 text-base text-slate-200">
          These programs exist in Ontario, but based on your answers you may
          not qualify at the moment. If your situation changes, you can check
          again.
        </p>

        <div className="space-y-3">
          {ineligibleIds.map((id) => (
            <div
              key={id}
              className="rounded-lg border border-slate-800 bg-slate-950 p-4"
            >
              <p className="text-lg font-semibold text-slate-50">
                {PROGRAM_LABELS[id] ?? id}
              </p>
              <p className="mt-2 text-base text-slate-200">
                {flags
                  ? reasonForIneligibility(id, flags)
                  : "Based on your answers, this program is not a match right now."}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
