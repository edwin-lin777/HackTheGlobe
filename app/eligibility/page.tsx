"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;
type SituationSubStep = 1 | 2 | 3 | 4 | 5;

export default function EligibilityPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);

  const [postalCode, setPostalCode] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");

  const [hasArrears, setHasArrears] = useState(false);
  const [isHeatedElectric, setIsHeatedElectric] = useState(false);
  const [hasEnbridge, setHasEnbridge] = useState(false);
  const [onOwOrOdsp, setOnOwOrOdsp] = useState(false);
  const [hasDisability, setHasDisability] = useState(false);

  // NEW: explicit Northern Ontario flag
  const [livesInNorthernOntario, setLivesInNorthernOntario] = useState(false);

  const [situationSubStep, setSituationSubStep] =
    useState<SituationSubStep>(1);

  function goNext() {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setSituationSubStep((prev) =>
        prev < 5 ? ((prev + 1) as SituationSubStep) : prev
      );
    }
  }

  function goBackOne() {
    if (step === 3 && situationSubStep > 1) {
      setSituationSubStep((prev) => (prev - 1) as SituationSubStep);
      return;
    }
    if (step === 3 && situationSubStep === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(1);
    }
  }

  function handleBackClick() {
    if (step === 1) {
      const leave = window.confirm(
        "Do you want to exit and go back to the home page?"
      );
      if (leave) {
        router.push("/");
      }
    } else {
      goBackOne();
    }
  }

  async function goToResults() {
    if (!postalCode.match(/^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/)) {
      alert("Please enter a valid postal code, like M5V 2T6.");
      return;
    }

    const sizeNum = Number(householdSize);
    const incomeNum = Number(householdIncome);

    if (!sizeNum || sizeNum < 1) {
      alert("Please enter how many people live in your household.");
      return;
    }

    if (!incomeNum || incomeNum < 0) {
      alert("Please enter your approximate yearly income after tax.");
      return;
    }

    const payload = {
      postalCode,
      householdSize: sizeNum,
      annualIncome: incomeNum,
      hasArrears,
      isHeatedElectric,
      hasEnbridge,
      onOwOrOdsp,
      hasDisability,
      // NEW: send explicit Northern Ontario flag to API
      livesInNorthernOntario,
    };

    try {
      const res = await fetch("/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Eligibility response status:", res.status);

      const text = await res.text();
      console.log("Raw response text:", text);

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("Response was not valid JSON");
      }

      if (!res.ok) {
        console.error("Eligibility check failed:", res.status, data);
        return;
      }

      console.log("Parsed eligibility data:", data);

      const hasAnyProgram =
        data && Array.isArray(data.programs) && data.programs.length > 0;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("eligibilityResult", JSON.stringify(data));
      }

      const params = new URLSearchParams({
        postalCode,
        hasPrograms: String(hasAnyProgram),
      });

      router.push(`/dashboard?${params.toString()}`);
    } catch (err) {
      console.error("Error calling /api/eligibility:", err);
    }
  }

  const onLastSituationSubStep = situationSubStep === 5;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <section aria-labelledby="eligibility-heading">
        <h1
          id="eligibility-heading"
          className="mb-3 text-3xl font-extrabold text-slate-50"
        >
          Check your energy support eligibility
        </h1>
        <p className="mb-6 text-base text-slate-200">
          We will ask a few short questions. You can go back at any time.
        </p>

        {/* High-level steps */}
        <ol
          className="mb-8 flex items-center justify-between text-sm"
          aria-label="Form steps"
        >
          {[
            { id: 1, label: "Where you live" },
            { id: 2, label: "Household & income" },
            { id: 3, label: "Your situation" },
          ].map((item) => {
            const isActive = step === item.id;
            const isDone = step > item.id;
            return (
              <li key={item.id} className="flex flex-1 items-center">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      isActive
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : isDone
                        ? "border-green-400 bg-green-400 text-black"
                        : "border-slate-600 bg-slate-900 text-slate-100"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {item.id}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-yellow-300"
                        : isDone
                        ? "text-slate-200"
                        : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {item.id < 3 && (
                  <div className="mx-2 h-px flex-1 bg-slate-700" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-50">
                Step 1 of 3: Where you live
              </h2>
              <p className="text-base text-slate-200">
                This helps us find programs that apply to your area.
              </p>
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-base font-medium text-slate-100"
                >
                  What is your postal code?
                </label>
                <input
                  id="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  inputMode="text"
                  maxLength={7}
                  value={postalCode}
                  onChange={(e) => {
                    // allow letters, digits, and space only
                    let value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9 ]/g, "");

                    // auto-insert space after 3rd character if user keeps typing
                    if (value.length === 3 && !value.includes(" ")) {
                      value = value + " ";
                    }

                    setPostalCode(value);
                  }}
                  pattern="[A-Z][0-9][A-Z] [0-9][A-Z][0-9]"
                  placeholder="A1A 1A1"
                  className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-slate-50 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Example: M5V 2T6
                </p>
              </div>

              {/* Northern Ontario toggle */}
              <fieldset className="space-y-2">
                <legend className="text-base font-medium text-slate-100">
                  Do you live in Northern Ontario?
                </legend>
                <p className="text-sm text-slate-300">
                  If you are not sure, answer as best you can. This helps with
                  Northern Ontario Energy Credit–type supports.
                </p>
                <label className="inline-flex items-center gap-3 text-base text-slate-100">
                  <input
                    type="checkbox"
                    checked={livesInNorthernOntario}
                    onChange={(e) =>
                      setLivesInNorthernOntario(e.target.checked)
                    }
                    className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                  />
                  <span>Yes, I live in Northern Ontario</span>
                </label>
              </fieldset>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-50">
                Step 2 of 3: Your household and income
              </h2>
              <p className="text-base text-slate-200">
                An estimate is okay. Use the total for everyone in your home,
                after tax.
              </p>

              <div>
                <label
                  htmlFor="householdSize"
                  className="block text-base font-medium text-slate-100"
                >
                  How many people live in your household?
                </label>
                <input
                  id="householdSize"
                  type="number"
                  min={1}
                  step={1}
                  value={householdSize}
                  onChange={(e) =>
                    setHouseholdSize(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-slate-50 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label
                  htmlFor="householdIncome"
                  className="block text-base font-medium text-slate-100"
                >
                  About how much is your total household income per year, after
                  tax?
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <span aria-hidden="true" className="text-lg">
                    $
                  </span>
                  <input
                    id="householdIncome"
                    type="number"
                    min={0}
                    step={1000}
                    value={householdIncome}
                    onChange={(e) =>
                      setHouseholdIncome(
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    className="block w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-slate-50 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 – mini wizard */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-50">
                Step 3 of 3: Your situation
              </h2>
              <p className="text-base text-slate-200">
                These questions help us match you with supports that fit your
                needs.
              </p>

              <p className="text-sm text-slate-300">
                Question {situationSubStep} of 5
              </p>

              {situationSubStep === 1 && (
                <fieldset className="space-y-2">
                  <legend className="text-base font-medium text-slate-100">
                    Overdue bills
                  </legend>
                  <p className="text-sm text-slate-300">
                    Some emergency programs help if you are behind on your
                    energy bill.
                  </p>
                  <label className="inline-flex items-center gap-3 text-base text-slate-100">
                    <input
                      type="checkbox"
                      checked={hasArrears}
                      onChange={(e) => setHasArrears(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                    />
                    <span>Yes, I am behind on my electricity or gas bill</span>
                  </label>
                </fieldset>
              )}

              {situationSubStep === 2 && (
                <fieldset className="space-y-2">
                  <legend className="text-base font-medium text-slate-100">
                    How your home is heated
                  </legend>
                  <p className="text-sm text-slate-300">
                    This helps us match you to electricity and gas programs.
                  </p>
                  <label className="inline-flex items-center gap-3 text-base text-slate-100">
                    <input
                      type="checkbox"
                      checked={isHeatedElectric}
                      onChange={(e) =>
                        setIsHeatedElectric(e.target.checked)
                      }
                      className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                    />
                    <span>My home is heated mainly with electricity</span>
                  </label>
                </fieldset>
              )}

              {situationSubStep === 3 && (
                <fieldset className="space-y-2">
                  <legend className="text-base font-medium text-slate-100">
                    Natural gas bill
                  </legend>
                  <p className="text-sm text-slate-300">
                    Some programs are only for Enbridge gas customers.
                  </p>
                  <label className="inline-flex items-center gap-3 text-base text-slate-100">
                    <input
                      type="checkbox"
                      checked={hasEnbridge}
                      onChange={(e) => setHasEnbridge(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                    />
                    <span>I have a natural gas bill from Enbridge</span>
                  </label>
                </fieldset>
              )}

              {situationSubStep === 4 && (
                <fieldset className="space-y-2">
                  <legend className="text-base font-medium text-slate-100">
                    Income support
                  </legend>
                  <p className="text-sm text-slate-300">
                    Some programs are for people on Ontario Works or ODSP.
                  </p>
                  <label className="inline-flex items-center gap-3 text-base text-slate-100">
                    <input
                      type="checkbox"
                      checked={onOwOrOdsp}
                      onChange={(e) => setOnOwOrOdsp(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                    />
                    <span>I receive Ontario Works or ODSP</span>
                  </label>
                </fieldset>
              )}

              {situationSubStep === 5 && (
                <fieldset className="space-y-2">
                  <legend className="text-base font-medium text-slate-100">
                    Disability in your household
                  </legend>
                  <p className="text-sm text-slate-300">
                    Some programs give more support if someone has a
                    disability.
                  </p>
                  <label className="inline-flex items-center gap-3 text-base text-slate-100">
                    <input
                      type="checkbox"
                      checked={hasDisability}
                      onChange={(e) =>
                        setHasDisability(e.target.checked)
                      }
                      className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                    />
                    <span>
                      Yes, at least one person in my household has a disability
                    </span>
                  </label>
                </fieldset>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify_between">
            <button
              type="button"
              onClick={handleBackClick}
              className="rounded-md px-4 py-3 text-base font-medium text-slate-200"
            >
              Back
            </button>

            {step === 3 && onLastSituationSubStep ? (
              <button
                type="button"
                onClick={goToResults}
                className="inline-flex items-center rounded-md bg-yellow-400 px-6 py-3 text-lg font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                See my possible supports
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center rounded-md bg-yellow-400 px-6 py-3 text-lg font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
