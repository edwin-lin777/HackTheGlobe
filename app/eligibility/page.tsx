"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Zap,
} from "lucide-react";

type Question = {
  id: string;
  label: string;
  question: string;
  type: "yes_no" | "number" | "select" | "postal";
  options?: { value: string; label: string }[];
  help?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "postalCode",
    label: "Postal code",
    question: "What's your postal code?",
    type: "postal",
    help: "We use this to determine eligibility for regional programs.",
  },
  {
    id: "householdSize",
    label: "Household size",
    question: "How many people live in your home?",
    type: "number",
    help: "This affects income eligibility thresholds.",
  },
  {
    id: "annualIncome",
    label: "Annual income",
    question: "What is your household's gross annual income?",
    type: "number",
    help: "Before taxes. All income sources included.",
  },
  {
    id: "isOWSP",
    label: "Social assistance",
    question: "Are you or anyone in your household on Ontario Works or ODSP?",
    type: "yes_no",
    help: "This qualifies you for OESP automatically.",
  },
  {
    id: "hasArrears",
    label: "Overdue bill",
    question: "Are you behind on your electricity or gas bill?",
    type: "yes_no",
    help: "Required for LEAP emergency assistance.",
  },
  {
    id: "isElectricHeat",
    label: "Heat type",
    question: "Is your home heated with electricity?",
    type: "yes_no",
    help: "Affects certain program eligibility.",
  },
  {
    id: "isEnbridgeCustomer",
    label: "Gas provider",
    question: "Are you an Enbridge Gas customer?",
    type: "yes_no",
    help: "Required for Enbridge winterproofing.",
  },
  {
    id: "isNorthernOntario",
    label: "Location",
    question: "Do you live in Northern Ontario?",
    type: "yes_no",
    help: "Northern Ontario Energy Credit eligibility.",
  },
];

export default function ApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const isAnswered =
    answers[question.id] !== undefined &&
    answers[question.id] !== "" &&
    (question.id !== "postalCode" ||
      /^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/.test(String(answers[question.id])));

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAnswer = (value: string | number | boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]:
        typeof value === "boolean" ? (value ? "yes" : "no") : value,
    }));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      const ok = window.confirm(
        "Are you sure you want to exit? Your answers will be lost.",
      );
      if (ok) {
        window.location.href = "/";
      }
      return;
    }
    handlePrevious();
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode: (answers.postalCode as string)?.trim(),
          householdSize: parseInt(`${answers.householdSize}`) || 1,
          annualIncome: parseInt(`${answers.annualIncome}`) || 0,
          isOWSP: answers.isOWSP === "yes",
          hasArrears: answers.hasArrears === "yes",
          isElectricHeat: answers.isElectricHeat === "yes",
          isEnbridgeCustomer: answers.isEnbridgeCustomer === "yes",
          isNorthernOntario: answers.isNorthernOntario === "yes",
        }),
      });

      if (!res.ok) {
        console.error("API error:", res.status);
        alert("Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      sessionStorage.setItem("eligibilityResult", JSON.stringify(data));
      setSubmitted(true);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{
            textAlign: "center",
            background: "white",
            borderRadius: "16px",
            padding: "48px 32px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            maxWidth: "320px",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#f0fdf4",
              marginBottom: "16px",
            }}
          >
            <CheckCircle size={32} color="#059669" fill="#059669" />
          </motion.div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "#111827",
              margin: "0 0 8px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Great job!
          </h2>
          <p
            style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}
          >
            We're calculating your personalized programs...
          </p>
          <motion.div
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              height: "2px",
              background: "linear-gradient(90deg, #059669, #10b981)",
              borderRadius: "99px",
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #f3f4f6",
          padding: "0 28px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "27px",
              height: "27px",
              borderRadius: "7px",
              background: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={13} color="white" fill="white" />
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            SubsidyAccess
          </span>
        </Link>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#9ca3af",
          }}
        >
          Step {currentStep + 1} of {QUESTIONS.length}
        </span>
      </nav>

      {/* CONTENT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 52px)",
          padding: "32px 20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              height: "3px",
              background: "#e5e7eb",
              borderRadius: "99px",
              marginBottom: "32px",
              overflow: "hidden",
              originX: 0,
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #2563eb, #059669)",
                borderRadius: "99px",
              }}
            />
          </motion.div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.28 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#111827",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.03em",
                }}
              >
                {question.question}
              </motion.h2>

              {question.help && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 24px 0",
                    lineHeight: 1.6,
                  }}
                >
                  {question.help}
                </motion.p>
              )}

              {/* YES/NO */}
              {question.type === "yes_no" && (
                <div style={{ display: "flex", gap: "12px" }}>
                  {[true, false].map((value, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      onClick={() => handleAnswer(value)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: `2px solid ${
                          answers[question.id] === (value ? "yes" : "no")
                            ? "#2563eb"
                            : "#e5e7eb"
                        }`,
                        background:
                          answers[question.id] === (value ? "yes" : "no")
                            ? "#eff6ff"
                            : "white",
                        fontSize: "13px",
                        fontWeight: "600",
                        color:
                          answers[question.id] === (value ? "yes" : "no")
                            ? "#1e40af"
                            : "#374151",
                        cursor: "pointer",
                        transition: "all 0.16s",
                      }}
                      whileHover={{
                        scale: 1.02,
                        borderColor:
                          answers[question.id] === (value ? "yes" : "no")
                            ? "#2563eb"
                            : "#d1d5db",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {value ? "Yes" : "No"}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* NUMBER */}
              {question.type === "number" && (
                <motion.input
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  type="number"
                  placeholder="Enter amount..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(parseInt(e.target.value) || "")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "2px solid #e5e7eb",
                    fontSize: "14px",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.16s",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      "#2563eb";
                    (e.target as HTMLInputElement).style.boxShadow =
                      "0 0 0 3px rgba(37,99,235,0.1)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      "#e5e7eb";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }}
                />
              )}

              {/* SELECT */}
              {question.type === "select" && question.options && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {question.options.map((opt, i) => (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      onClick={() => handleAnswer(opt.value)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: `2px solid ${
                          answers[question.id] === opt.value
                            ? "#2563eb"
                            : "#e5e7eb"
                        }`,
                        background:
                          answers[question.id] === opt.value
                            ? "#eff6ff"
                            : "white",
                        fontSize: "13px",
                        fontWeight: "500",
                        color:
                          answers[question.id] === opt.value
                            ? "#1e40af"
                            : "#374151",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.16s",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      whileHover={{
                        scale: 1.01,
                        borderColor:
                          answers[question.id] === opt.value
                            ? "#2563eb"
                            : "#d1d5db",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {opt.label}
                      {answers[question.id] === opt.value && (
                        <CheckCircle size={14} color="#2563eb" fill="#2563eb" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
              {/* POSTAL CODE (X#X #X#) */}
              {question.type === "postal" && (
                <motion.input
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  type="text"
                  placeholder="M5V 2T6"
                  inputMode="text"
                  autoComplete="postal-code"
                  value={answers[question.id] || ""}
                  onChange={(e) => {
                    let v = e.target.value.toUpperCase();

                    // Keep only letters, digits
                    v = v.replace(/[^A-Z0-9]/g, "");

                    // Limit to 6 raw chars (e.g. M5V2T6)
                    v = v.slice(0, 6);

                    // Insert space after 3rd char if we have more than 3
                    if (v.length > 3) {
                      v = v.slice(0, 3) + " " + v.slice(3);
                    }

                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: v,
                    }));
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border:
                      answers._postalValid === "no"
                        ? "2px solid #dc2626"
                        : "2px solid #e5e7eb",
                    fontSize: "14px",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.16s",
                    letterSpacing: "0.08em",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      answers._postalValid === "no" ? "#dc2626" : "#2563eb";
                    (e.target as HTMLInputElement).style.boxShadow =
                      "0 0 0 3px rgba(37,99,235,0.1)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      answers._postalValid === "no" ? "#dc2626" : "#e5e7eb";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "40px",
            }}
          >
            <motion.button
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              onClick={handleBack}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                background: "white",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                cursor: "pointer",
                opacity: currentStep === 0 ? 0.9 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition: "all 0.16s",
              }}
              whileHover={{ background: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft size={12} /> Back
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              onClick={handleNext}
              disabled={!isAnswered}
              style={{
                flex: 2,
                padding: "10px 14px",
                borderRadius: "10px",
                background: isAnswered
                  ? "linear-gradient(135deg, #2563eb, #1e40af)"
                  : "#e5e7eb",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                color: isAnswered ? "white" : "#9ca3af",
                cursor: isAnswered ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
              whileHover={isAnswered ? { scale: 1.01 } : {}}
              whileTap={isAnswered ? { scale: 0.98 } : {}}
            >
              {isLastStep ? "See results" : "Next"} <ChevronRight size={12} />
            </motion.button>
          </div>

          {/* SIDE INFO */}
          {currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                marginTop: "32px",
                padding: "14px",
                background: "white",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                }}
              >
                <AlertCircle
                  size={12}
                  color="#9ca3af"
                  style={{ marginTop: "1px", flexShrink: 0 }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "#6b7280",
                    lineHeight: 1.6,
                  }}
                >
                  Your information is encrypted and not stored. It's only used
                  to calculate your eligibility.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
