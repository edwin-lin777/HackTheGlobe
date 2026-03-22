"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "not_started" | "in_progress" | "submitted";

type Program = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  description: string;
  applyUrl: string | null;
  annualSaving: number | null;
  monthlyCredit: number | null;
  status: Status;
  howToApply: string;
  documents: string[];
};

type DashboardData = {
  programs: Program[];
  billImpact: {
    ldcName: string;
    monthlyBill: number;
    annualBill: number;
    totalAnnualSaving: number;
    savingPercentage: number;
  };
};

type ProgramIntakeAnswers = Record<string, string>;

type ToastType = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastType[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "all",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              t.type === "success"
                ? "#f0fdf4"
                : t.type === "error"
                ? "#fef2f2"
                : "#eff6ff",
            border: `1px solid ${
              t.type === "success"
                ? "#a7f3d0"
                : t.type === "error"
                ? "#fecaca"
                : "#bfdbfe"
            }`,
            color:
              t.type === "success"
                ? "#065f46"
                : t.type === "error"
                ? "#b91c1c"
                : "#1e40af",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            minWidth: 260,
            maxWidth: 340,
          }}
        >
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.45,
              fontSize: 18,
              lineHeight: 1,
              padding: 0,
              color: "inherit",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const counter = useRef(0);

  function toast(message: string, type: ToastType["type"] = "info") {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  }

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, toast, dismiss };
}

export default function ProgramIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId");

  const { toasts, toast, dismiss } = useToast();

  const [program, setProgram] = useState<Program | null>(null);
  const [answers, setAnswers] = useState<ProgramIntakeAnswers>({});
  const [step, setStep] = useState<"form" | "review">("form");

  useEffect(() => {
    if (!programId) return;

    const raw = sessionStorage.getItem("eligibilityResult");
    if (!raw) return;

    try {
      const data: DashboardData = JSON.parse(raw);
      const p = data.programs.find((pr) => pr.id === programId);
      if (!p) return;

      setProgram(p);

      const rawDocs = sessionStorage.getItem("documentDetails");
      if (rawDocs) {
        try {
          const docDetails = JSON.parse(rawDocs) as Record<string, string>;
          const initial: ProgramIntakeAnswers = {};
          p.documents.forEach((doc) => {
            const key = `${p.id}::${doc}`;
            if (docDetails[key]) initial[doc] = docDetails[key];
          });
          setAnswers(initial);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }, [programId]);

  if (!programId || !program) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <p
            style={{
              fontSize: 14,
              color: "#111827",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Program not found
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
            Go back to your dashboard and try again.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 999,
              border: "none",
              background: "#111827",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to dashboard
          </button>
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    );
  }

  const safeProgram = program as Program;
  const docs = safeProgram.documents;

  function handleSubmitForm() {
    const missing = docs.filter(
      (doc) => !answers[doc] || answers[doc].trim() === "",
    );
    if (missing.length > 0) {
      toast(
        "Please fill in all document details before continuing.",
        "error",
      );
      return;
    }

    const existingRaw = sessionStorage.getItem("documentDetails");
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const merged = { ...existing };

    docs.forEach((doc) => {
      const key = `${safeProgram.id}::${doc}`;
      merged[key] = answers[doc] ?? "";
    });
    sessionStorage.setItem("documentDetails", JSON.stringify(merged));

    // NEW: mark this program as in_progress so dashboard can pick it up
    const statusRaw = sessionStorage.getItem("programStatuses");
    const statusMap: Record<string, Status> = statusRaw
      ? JSON.parse(statusRaw)
      : {};
    statusMap[safeProgram.id] = "in_progress";
    sessionStorage.setItem("programStatuses", JSON.stringify(statusMap));

    setStep("review");
  }

  function handleDownloadSummary() {
    const lines: string[] = [];

    lines.push(`Program: ${safeProgram.name}`);
    lines.push(`Short name: ${safeProgram.shortName}`);
    if (safeProgram.applyUrl) {
      lines.push(`Apply online: ${safeProgram.applyUrl}`);
    }
    lines.push("");
    lines.push("Documents and details");
    lines.push("---------------------");

    docs.forEach((docName) => {
      const value = answers[docName] || "— not provided —";
      lines.push("");
      lines.push(`• ${docName}`);
      lines.push(value);
    });

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `SubsidyAccess-${safeProgram.shortName}-info.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast("Summary downloaded.", "success");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #fafafa 55%, #fdf4ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div id="intake-card" style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow:
              "0 20px 60px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
            padding: "24px 24px 20px",
          }}
        >
          {step === "form" && (
            <>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  margin: "0 0 6px",
                }}
              >
                Application prep
              </p>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#111827",
                  margin: "0 0 4px",
                  letterSpacing: "-0.03em",
                }}
              >
                Info for {safeProgram.shortName}
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  margin: "0 0 16px",
                }}
              >
                Fill in the details you’ll need when you apply to{" "}
                {safeProgram.name}.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                {docs.map((doc) => (
                  <div
                    key={doc}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {doc}
                    </label>
                    <textarea
                      value={answers[doc] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [doc]: e.target.value,
                        }))
                      }
                      placeholder="Type the exact info here (account number, ID details, notes for yourself, etc.)"
                      style={{
                        width: "100%",
                        minHeight: 56,
                        fontSize: 12,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "rgba(255,255,255,0.95)",
                        resize: "vertical",
                        fontFamily: "inherit",
                        color: "#111827",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div
                id="intake-actions"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <button
                  onClick={handleSubmitForm}
                  style={{
                    width: "100%",
                    height: 46,
                    background: "#111827",
                    color: "white",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Review my info
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  style={{
                    width: "100%",
                    height: 38,
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Back to dashboard
                </button>
              </div>
            </>
          )}

          {step === "review" && (
            <>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  margin: "0 0 6px",
                }}
              >
                Application summary
              </p>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#111827",
                  margin: "0 0 4px",
                  letterSpacing: "-0.03em",
                }}
              >
                Your info for {safeProgram.shortName}
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  margin: "0 0 16px",
                }}
              >
                Save this summary and have it handy when you apply.
              </p>

              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  padding: "12px 14px",
                  background: "#f9fafb",
                  maxHeight: 260,
                  overflow: "auto",
                }}
              >
                {docs.map((doc) => (
                  <div key={doc} style={{ marginBottom: 10 }}>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#374151",
                      }}
                    >
                      {doc}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "#4b5563",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {answers[doc] || "— not provided —"}
                    </p>
                  </div>
                ))}
              </div>

              <div
                id="intake-actions"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 14,
                }}
              >
                <button
                  onClick={handleDownloadSummary}
                  style={{
                    width: "100%",
                    height: 44,
                    background: "#111827",
                    color: "white",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Download summary
                </button>
                <button
                  onClick={() => setStep("form")}
                  style={{
                    width: "100%",
                    height: 38,
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Edit my answers
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  style={{
                    width: "100%",
                    height: 38,
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Back to dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}