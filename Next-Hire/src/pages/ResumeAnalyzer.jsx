// src/pages/ResumeAnalyzer.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sanitizeResult, computeAdjustedScore } from "./resumeUtils";

const logoSrc = "/logo.png";
const appName = "NextHire";

/* THEME */
const THEME = {
  bg: "#071226",
  pane: "rgba(255,255,255,0.025)",
  accent1: "#06b6d4",
  accent2: "#7c3aed",
  success: "#10b981",
  danger: "#ff6b6b",
  muted: "#98a6b3",
  glass: "rgba(255,255,255,0.02)",
};

const baseFont = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";

/* ---------- Utility: generate better tips & suggested bullets ---------- */

/**
 * Generate actionable improvement tips based on resume analysis.
 * Uses missing keywords, weaknesses, projects, and summary to craft targeted advice.
 */
function generateImprovementTips(cleaned = {}) {
  const tips = [];
  const mk = Array.isArray(cleaned.missing_keywords) ? cleaned.missing_keywords : [];
  const weaknesses = Array.isArray(cleaned.weaknesses) ? cleaned.weaknesses : [];
  const projects = Array.isArray(cleaned.projects) ? cleaned.projects : [];
  const summary = typeof cleaned.summary === "string" ? cleaned.summary : "";

  // If missing keywords exist, suggest adding them with placement guidance
  if (mk.length) {
    tips.push(
      `Add these ATS keywords into your work summaries, project bullets, and skills section: ${mk.slice(0, 8).join(
        ", "
      )}. Put the most important ones in your top 3 bullets for each project.`
    );
    tips.push(
      `Prefer context over keyword lists — show how you used the technology (e.g., "Improved X using ${mk[0]} to achieve Y%").`
    );
  } else {
    tips.push("Your resume already includes recommended ATS keywords — focus on concrete impact and metrics next.");
  }

  // If weaknesses exist, turn each into a growth action
  if (weaknesses.length) {
    weaknesses.slice(0, 4).forEach((w) => {
      tips.push(actionForWeakness(w));
    });
  } else {
    // No explicit weaknesses — suggest areas to strengthen based on projects or summary length
    if (!projects.length) {
      tips.push("Add 1–2 concise project case studies (title, tech stack, 1 measurable result) to showcase applied skills.");
    }
    if (summary.length < 60) {
      tips.push("Expand your summary to 2–3 short sentences highlighting one achievement and the tech you used.");
    } else {
      tips.push("Quantify results where possible (reduce ambiguity): add percentage improvements, time saved, or user counts.");
    }
  }

  // Always include a couple of polishing tips
  tips.push("Use consistent verb tense and strong action verbs (Led, Implemented, Reduced, Automated, Scaled).");
  tips.push("Attach GitHub/Live demo links for projects — recruiters love clickable proof.");
  // Unique final tip based on projects presence
  if (projects.length) {
    tips.push("For each project, include a single 'result' line: what you built, the tech used, and one measurable outcome.");
  }

  // dedupe and return up to 8 tips
  return [...new Set(tips)].slice(0, 8);
}

/** Map a weakness sentence to a recommended actionable step */
function actionForWeakness(weakness) {
  const w = weakness.toLowerCase();
  if (w.includes("communication")) return "Practice STAR-format bullets for interviews and add 1-2 presentation or teamwork examples.";
  if (w.includes("limited experience") || w.includes("lack")) return "Build a small, public project that targets the missing skill and add it as a project with measurable outcome.";
  if (w.includes("sustainability") || w.includes("domain")) return "Take a short domain-focused course or contribute to an open-source project to show domain exposure.";
  if (w.includes("project management")) return "Add ownership bullets (scope, stakeholders, delivery) for any group project to demonstrate project-management experience.";
  // fallback
  return `Address this area by creating a small demonstrable deliverable (project or sample) and describing a measurable result.`;
}

/**
 * Create suggested resume bullets embedding missing keywords.
 * These are ready-to-copy lines to paste into resume bullets.
 */
function generateSuggestedBullets(missingKeywords = []) {
  if (!missingKeywords || !missingKeywords.length) return [];

  const templates = [
    (k) => `Led a project implementing ${k} to improve system reliability, reducing failures by X% over Y months.`,
    (k) => `Implemented ${k} in a production prototype to accelerate feature delivery and tested with N users.`,
    (k) => `Built automation using ${k} that decreased manual effort by X hours/week and improved accuracy.`,
    (k) => `Designed and documented a ${k}-based workflow integrated with existing services for faster deployments.`,
    (k) => `Collaborated with cross-functional team to apply ${k} in solving [problem], delivering measurable impact.`,
  ];

  const bullets = missingKeywords.slice(0, 6).map((k, i) => {
    const template = templates[i % templates.length];
    return template(k);
  });

  return bullets;
}

/* Small UI building blocks */
function GradeBadge({ score }) {
  const color = score >= 85 ? THEME.success : score >= 70 ? THEME.accent1 : score >= 50 ? "#f5a623" : THEME.danger;
  const label = score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";
  return (
    <div
      style={{
        minWidth: 44,
        height: 28,
        borderRadius: 999,
        background: `${color}20`,
        color,
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 10px",
        fontSize: 13,
      }}
    >
      {label}
    </div>
  );
}

function SmallStat({ title, value, sub }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, color: THEME.muted, marginTop: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "#6b7682", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [adjustedScore, setAdjustedScore] = useState(null);

  useEffect(() => window.scrollTo(0, 0), []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") return alert("Please upload a PDF file (text-based preferred).");
    setFile(selected);
    setResult(null);
    setError("");
    setAdjustedScore(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    setAdjustedScore(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/analyze-resume", { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Analysis failed. Check backend.");
      }
      const data = await res.json();
      const cleaned = sanitizeResult(data);
      const adjusted = computeAdjustedScore(cleaned.score ?? 0, cleaned);
      // If backend didn't provide tips, generate stronger ones here
      if (!cleaned.tips || !cleaned.tips.length) {
        cleaned.tips = generateImprovementTips(cleaned);
      }
      // ensure missing_keywords array exists
      if (!Array.isArray(cleaned.missing_keywords)) cleaned.missing_keywords = [];
      // Provide suggested bullets if none exist
      cleaned.suggested_bullets = generateSuggestedBullets(cleaned.missing_keywords);

      setResult(cleaned);
      setAdjustedScore(adjusted);
    } catch (err) {
      console.error(err);
      setError("Error analyzing resume. Make sure backend is running and the PDF is text-based.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setAdjustedScore(null);
  };

  const handleDownload = () => {
    if (!result) return;
    const payload = { analyzedAt: new Date().toISOString(), original: result, adjustedScore };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Normalized numeric values used in UI
  const adj = Number.isFinite(Number(adjustedScore)) ? Math.round(Number(adjustedScore)) : 0;
  const backendScore = result && Number.isFinite(Number(result.score)) ? Math.round(Number(result.score)) : 0;
  const projectsCount = (result?.projects && Array.isArray(result.projects)) ? result.projects.length : 0;
  const missingKeywords = Array.isArray(result?.missing_keywords) ? result.missing_keywords : [];
  const suggestedBullets = Array.isArray(result?.suggested_bullets) ? result.suggested_bullets : [];
  const displayTips = (result?.tips && result.tips.length) ? result.tips : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: baseFont,
        background: `linear-gradient(180deg, ${THEME.bg}, #031022 60%)`,
        color: "#e6f6ff",
        padding: 20,
        display: "flex",
        gap: 20,
        boxSizing: "border-box",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: 300,
          borderRadius: 14,
          padding: 20,
          background: THEME.pane,
          border: `1px solid ${THEME.glass}`,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          boxShadow: "0 8px 30px rgba(2,6,12,0.6)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={logoSrc} alt="logo" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: THEME.accent1 }}>{appName}</div>
            <div style={{ fontSize: 13, color: THEME.muted }}>Candidate Tools</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => navigate("/dashboard")} style={navButton(false)}>
            ▣ Dashboard
          </button>
          <button style={navButton(true)}>💼 Resume Analyzer</button>
          <button onClick={() => navigate("/coach")} style={navButton(false)}>
            💬 Interview Coach
          </button>
          <button onClick={() => navigate("/interview")} style={navButton(false)}>
            🎯 Mock Interview
          </button>
        </nav>

        <div style={{ marginTop: "auto", fontSize: 13, color: THEME.muted }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Pro Tip</div>
          Use clear action verbs and group technologies per bullet. Add links to projects (GitHub / demo) for maximum ATS impact.
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>AI Resume Analyzer</div>
            <div style={{ fontSize: 13, color: THEME.muted }}>Instant ATS score · actionable tips · missing keywords</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleDownload} disabled={!result} style={{ ...primaryButton, opacity: result ? 1 : 0.6 }}>
              Download Report
            </button>
            <button onClick={() => alert("Share flow not implemented")} style={ghostButton}>
              Share
            </button>
          </div>
        </header>

        {/* Upload Card */}
        <section
          style={{
            borderRadius: 14,
            padding: 18,
            background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.007))",
            border: `1px solid ${THEME.glass}`,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#04121a",
              fontSize: 34,
            }}
          >
            {file ? "📄" : "☁️"}
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ cursor: "pointer", display: "block" }}>
              <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
              <div style={{ fontWeight: 900 }}>{file ? file.name : "Click to upload or drag & drop a resume (PDF)"}</div>
              <div style={{ color: THEME.muted, marginTop: 6, fontSize: 13 }}>PDF only — prefer text-based (not scanned) PDFs</div>
            </label>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button onClick={handleAnalyze} disabled={!file || analyzing} style={{ ...primaryButton, opacity: (!file || analyzing) ? 0.6 : 1 }}>
                {analyzing ? "Analyzing..." : "Analyze Resume"}
              </button>
              <button onClick={handleReset} style={ghostButton}>
                Reset
              </button>
              <button
                onClick={() => {
                  // Demo: quick mock object (helps users preview UI without backend)
                  const demo = {
                    summary:
                      "Jatin Malik is a dedicated learner with a passion for technology, currently advancing skills in artificial intelligence and computer applications. Focused on full-stack web development and cloud solutions.",
                    score: 82,
                    strengths: [
                      "Fast learner with ability to grasp new technologies quickly",
                      "Strong analytical thinking",
                      "Practical experience developing web projects",
                    ],
                    weaknesses: ["Limited experience in commercial project management"],
                    tips: [], // intentionally blank so we generate better tips client-side
                    missing_keywords: ["Cloud computing", "Cybersecurity", "Data analysis", "Machine learning"],
                    projects: [
                      { title: "E-commerce Portal", description: "React + Node + Postgres. Built checkout and product catalog.", keywords: ["react", "node", "postgres"] },
                    ],
                  };
                  const cleaned = sanitizeResult(demo);
                  const adjusted = computeAdjustedScore(cleaned.score, cleaned);
                  if (!cleaned.tips || !cleaned.tips.length) cleaned.tips = generateImprovementTips(cleaned);
                  if (!Array.isArray(cleaned.missing_keywords)) cleaned.missing_keywords = [];
                  cleaned.suggested_bullets = generateSuggestedBullets(cleaned.missing_keywords);
                  setResult(cleaned);
                  setAdjustedScore(adjusted);
                }}
                style={ghostButton}
              >
                Demo
              </button>
            </div>

            {error && <div style={{ marginTop: 10, color: THEME.danger }}>{error}</div>}
          </div>
        </section>

        {/* Results area */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: 20, alignItems: "start" }}>
          {!result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ gridColumn: "1 / -1", borderRadius: 14, padding: 28, background: THEME.pane, border: `1px solid ${THEME.glass}` }}
            >
              <div style={{ fontSize: 18, fontWeight: 900 }}>Ready to analyze</div>
              <div style={{ marginTop: 10, color: THEME.muted }}>
                Upload a resume and click Analyze to generate an instant report that includes an adjusted score and AI feedback.
              </div>
            </motion.div>
          ) : (
            <>
              {/* Left Column — Score card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                style={{ borderRadius: 14, padding: 18, background: THEME.pane, border: `1px solid ${THEME.glass}`, display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: THEME.muted, fontSize: 13 }}>Overall</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>Adjusted Score</div>
                  </div>
                  <GradeBadge score={adj} />
                </div>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 6 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 160, height: 160 }}>
                    <defs>
                      <linearGradient id="g1" x1="0%" x2="100%">
                        <stop offset="0%" stopColor={THEME.accent2} />
                        <stop offset="100%" stopColor={THEME.accent1} />
                      </linearGradient>
                    </defs>
                    <circle cx="18" cy="18" r="15.5" stroke="#071826" strokeWidth="3.5" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      stroke="url(#g1)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${Math.max(0, Math.min(100, adj))}, 100`}
                      transform="rotate(-90 18 18)"
                      style={{ transition: "stroke-dasharray 900ms cubic-bezier(.2,.8,.25,1)" }}
                    />
                    <text x="18" y="20.6" fontSize="8.5" fontWeight="800" fill="#dff8ff" textAnchor="middle">
                      {adj}
                    </text>
                    <text x="18" y="27.6" fontSize="3.2" fill={THEME.muted} textAnchor="middle">
                      /100
                    </text>
                  </svg>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <SmallStat title="Backend Score" value={backendScore} sub="Original" />
                  <SmallStat title="Projects" value={projectsCount} sub="Detected" />
                </div>

                <div>
                  <div style={{ fontSize: 13, color: THEME.muted }}>Snapshot</div>
                  <div style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.4 }}>
                    {result.summary ? (result.summary.length > 140 ? result.summary.slice(0, 140) + "…" : result.summary) : "No summary available."}
                  </div>
                </div>
              </motion.div>

              {/* Right — Feedback + Missing keywords + Suggested bullets */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ borderRadius: 14, padding: 20, background: THEME.pane, border: `1px solid ${THEME.glass}`, minHeight: 420 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>AI Feedback</h3>

                    <section style={{ marginTop: 14 }}>
                      <h4 style={{ margin: 0, color: THEME.success }}>✅ Strengths</h4>
                      <ul style={{ marginTop: 10, paddingLeft: 18, color: "#dff8ff", lineHeight: 1.6 }}>
                        {(result.strengths && result.strengths.length) ? result.strengths.map((s, idx) => <li key={idx}>{s}</li>) : <li>No strengths listed.</li>}
                      </ul>
                    </section>

                    <section style={{ marginTop: 12 }}>
                      <h4 style={{ margin: 0, color: THEME.danger }}>⚠️ Improvements</h4>
                      <ul style={{ marginTop: 10, paddingLeft: 18, color: "#dff8ff", lineHeight: 1.6 }}>
                        {(result.weaknesses && result.weaknesses.length) ? result.weaknesses.map((w, idx) => <li key={idx}>{w}</li>) : <li>No weaknesses listed.</li>}
                      </ul>
                    </section>

                    <section style={{ marginTop: 12 }}>
                      <h4 style={{ margin: 0, color: THEME.accent1 }}>💡 Tips</h4>
                      <ul style={{ marginTop: 10, paddingLeft: 18, color: "#dff8ff", lineHeight: 1.6 }}>
                        {displayTips.length ? displayTips.map((t, i) => <li key={i}>{t}</li>) : <li>No tips provided.</li>}
                      </ul>
                    </section>

                    {/* Show list of projects (simple) */}
                    <section style={{ marginTop: 16 }}>
                      <h4 style={{ margin: 0, color: THEME.muted }}>📚 Projects</h4>
                      <div style={{ marginTop: 10 }}>
                        {(result.projects && result.projects.length) ? result.projects.map((p, i) => (
                          <div key={i} style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.01)", marginBottom: 8 }}>
                            <div style={{ fontWeight: 800 }}>{p.title || `Project ${i + 1}`}</div>
                            <div style={{ fontSize: 13, color: THEME.muted }}>{p.description || (p.keywords && p.keywords.join(", ")) || "No description"}</div>
                          </div>
                        )) : <div style={{ color: THEME.muted }}>No projects detected.</div>}
                      </div>
                    </section>

                    {/* Missing keywords */}
                    <section style={{ marginTop: 18 }}>
                      <h4 style={{ margin: 0, color: "#f5a623" }}>🔑 Missing ATS Keywords</h4>
                      <div style={{ marginTop: 10 }}>
                        {missingKeywords.length ? (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {missingKeywords.map((k, i) => <span key={i} style={{ ...chip(true), background: "rgba(245,166,35,0.06)", color: "#f5a623" }}>{k}</span>)}
                          </div>
                        ) : (
                          <div style={{ color: THEME.muted, marginTop: 8 }}>No missing keywords detected — your resume already includes recommended ATS keywords.</div>
                        )}
                      </div>
                    </section>

                    {/* Suggested bullets (ready to paste) */}
                    <section style={{ marginTop: 18 }}>
                      <h4 style={{ margin: 0, color: THEME.accent2 }}>✍️ Suggested Resume Bullets</h4>
                      <div style={{ marginTop: 10 }}>
                        {suggestedBullets.length ? (
                          suggestedBullets.map((b, i) => (
                            <div key={i} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.01)", marginBottom: 8 }}>
                              <div style={{ fontSize: 14 }}>{b}</div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: THEME.muted }}>No suggested bullets available.</div>
                        )}
                        {suggestedBullets.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: THEME.muted }}>Tip: tailor each line with numbers (%, time, users) to make them measurable.</div>}
                      </div>
                    </section>

                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: THEME.muted }}>
          <div style={{ fontSize: 13 }}>Last analyzed: {result ? "just now" : "—"}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => alert("re-run")} style={ghostButton}>Re-run</button>
            <button onClick={() => alert("schedule report")} style={primaryButton}>Schedule Email</button>
          </div>
        </footer>
      </main>

      {/* Tiny global styles */}
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0);} 50% { transform: translateY(-4px);} 100% { transform: translateY(0);} }
        .found-chip { animation: floatUp 2200ms ease-in-out infinite; }
        button:disabled { cursor: not-allowed; opacity: 0.6; }
        @media (max-width: 1100px) {
          main { padding-right: 0; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Styles used by the component (JS helpers) ---------- */

const primaryButton = {
  background: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent1})`,
  color: "#042027",
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(7,17,27,0.6)"
};

const ghostButton = {
  background: "transparent",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${THEME.glass}`,
  color: THEME.muted,
  cursor: "pointer"
};

function navButton(active = false) {
  return {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 10,
    color: active ? THEME.accent1 : THEME.muted,
    background: active ? `${THEME.accent1}10` : "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    textAlign: "left"
  };
}

function chip(found = true) {
  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 13,
    marginRight: 8,
    marginBottom: 8,
    border: `1px solid rgba(255,255,255,0.03)`,
    background: found ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.06)",
    color: found ? THEME.success : THEME.danger,
  };
}