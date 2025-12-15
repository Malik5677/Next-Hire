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

/* ==================================================================================
   ICONS (Exact match to your Dashboard Screenshot)
   ================================================================================== */
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 10H3V3h7v7zm4-7v7h7V3h-7zM3 21h7v-7H3v7zm11 0h7v-7h-7v7z" />
    </svg>
  ),
  ResumeAnalyzer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
      <path d="M8 12h8v2H8zm0 4h8v2H8z" />
    </svg>
  ),
  ResumeBuilder: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
    </svg>
  ),
  AICoach: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
    </svg>
  ),
  MockInterview: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  )
};

/* ==================================================================================
   UTILITIES (Strictly Resume Focused)
   ================================================================================== */

function generateImprovementTips(cleaned = {}) {
  const tips = [];
  const mk = Array.isArray(cleaned.missing_keywords) ? cleaned.missing_keywords : [];
  const weaknesses = Array.isArray(cleaned.weaknesses) ? cleaned.weaknesses : [];
  const projects = Array.isArray(cleaned.projects) ? cleaned.projects : [];
  const summary = typeof cleaned.summary === "string" ? cleaned.summary : "";

  // 1. Keyword Tips
  if (mk.length) {
    tips.push(`Add these ATS keywords to your skills section: ${mk.slice(0, 6).join(", ")}.`);
    tips.push(`Incorporate "${mk[0]}" into a bullet point to show practical experience.`);
  } else {
    tips.push("Good job on keywords! Now focus on adding metrics (numbers/%) to your bullet points.");
  }

  // 2. Weakness to Resume Action (STRICT FILTERING)
  if (weaknesses.length) {
    weaknesses.slice(0, 4).forEach((w) => {
      // Ignore irrelevant interview feedback
      if (!w.toLowerCase().includes("nervous") && !w.toLowerCase().includes("speak")) {
         tips.push(actionForWeakness(w));
      }
    });
  }

  // 3. Formatting/Structure Tips
  if (summary.length < 50) {
    tips.push("Expand your professional summary to 2–3 sentences highlighting your years of experience and top skills.");
  }
  
  if (projects.length === 0) {
      tips.push("Add a 'Projects' section with 1-2 examples of your work to demonstrate hands-on skills.");
  }

  tips.push("Ensure every bullet point starts with a strong action verb (e.g., Engineered, Deployed, Optimized).");
  
  return [...new Set(tips)].slice(0, 6);
}

function actionForWeakness(weakness) {
  const w = weakness.toLowerCase();
  
  // FIX: Map strictly to RESUME edits, not interview advice
  if (w.includes("communication")) return "Demonstrate communication skills by adding a bullet point about cross-team collaboration or documentation.";
  if (w.includes("leadership")) return "Add a section or bullet point highlighting a time you mentored others or led a module.";
  if (w.includes("experience") || w.includes("lack")) return "Add a personal project or certification to your resume to cover this skill gap.";
  if (w.includes("management")) return "Mention project scope, timelines, or stakeholder management in your experience bullets.";
  
  // Generic fallback for resume
  return `Strengthen the section related to "${weakness}" by adding concrete examples or metrics.`;
}

function generateSuggestedBullets(missingKeywords = []) {
  if (!missingKeywords || !missingKeywords.length) return [];
  const templates = [
    (k) => `Led the implementation of ${k} to improve system scalability by 20%.`,
    (k) => `Automated manual workflows using ${k}, saving the team 10+ hours weekly.`,
    (k) => `Integrated ${k} into the existing stack to enhance performance and security.`,
    (k) => `Collaborated with cross-functional teams to deploy ${k} in a production environment.`,
    (k) => `Optimized database queries using ${k}, reducing latency by 40%.`
  ];
  return missingKeywords.slice(0, 5).map((k, i) => templates[i % templates.length](k));
}

/* UI Components */
function GradeBadge({ score }) {
  const color = score >= 85 ? THEME.success : score >= 70 ? THEME.accent1 : score >= 50 ? "#f5a623" : THEME.danger;
  const label = score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";
  return (
    <div style={{ minWidth: 44, height: 28, borderRadius: 999, background: `${color}20`, color, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
      {label}
    </div>
  );
}

function SmallStat({ title, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, color: THEME.muted, marginTop: 4 }}>{title}</div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
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
    if (selected.type !== "application/pdf") return alert("Please upload a PDF file.");
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

    try {
      const form = new FormData();
      form.append("file", file);

      // Connection to Backend
      const res = await fetch("http://127.0.0.1:8000/analyze-resume", { method: "POST", body: form });
      
      if (!res.ok) throw new Error("Backend Connection Failed");

      const data = await res.json();
      const analysisData = data.analysis || data; 
      const cleaned = sanitizeResult(analysisData);
      
      // --- CRITICAL FIX: FILTER OUT BEHAVIORAL/INTERVIEW FEEDBACK ---
      // This ensures the user doesn't see "nervousness" tips on a resume analyzer
      if (cleaned.weaknesses && Array.isArray(cleaned.weaknesses)) {
          cleaned.weaknesses = cleaned.weaknesses.filter(w => {
              const lower = w.toLowerCase();
              return !lower.includes("nervous") && 
                     !lower.includes("anxiety") && 
                     !lower.includes("eye contact") &&
                     !lower.includes("speak");
          });
          
          // If filtering made it empty, add a resume-specific placeholder
          if (cleaned.weaknesses.length === 0) {
              cleaned.weaknesses = ["Resume could use more quantifiable metrics (numbers/%)", "Action verbs could be stronger"];
          }
      }
      // ----------------------------------------------------
      
      const backendScore = cleaned.score || cleaned.ats_score || 0;
      const adjusted = computeAdjustedScore(backendScore, cleaned);

      if (!cleaned.tips?.length) cleaned.tips = generateImprovementTips(cleaned);
      if (!cleaned.missing_keywords) cleaned.missing_keywords = [];
      cleaned.suggested_bullets = generateSuggestedBullets(cleaned.missing_keywords);

      setResult(cleaned);
      setAdjustedScore(adjusted);
    } catch (err) {
      console.error(err);
      setError("Error analyzing resume. Make sure backend is running.");
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

  const adj = Number(adjustedScore) || 0;
  const backendScore = result ? (result.score || result.ats_score || 0) : 0;
  
  return (
    <div style={{ minHeight: "100vh", fontFamily: baseFont, background: `linear-gradient(180deg, ${THEME.bg}, #031022 60%)`, color: "#e6f6ff", padding: 20, display: "flex", gap: 20 }}>
      
      {/* ==================== SIDEBAR ==================== */}
      <aside style={{ width: 300, borderRadius: 14, padding: 20, background: THEME.pane, border: `1px solid ${THEME.glass}`, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={logoSrc} alt="logo" style={{ width: 48, height: 48, borderRadius: 10 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: THEME.accent1 }}>{appName}</div>
            <div style={{ fontSize: 13, color: THEME.muted }}>Candidate Tools</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          
          <button onClick={() => navigate("/dashboard")} style={navButton(false)}>
            <div style={{ marginTop: 4 }}><Icons.Dashboard /></div>
            Dashboard
          </button>
          
          <button style={navButton(true)}>
            <div style={{ marginTop: 4 }}><Icons.ResumeAnalyzer /></div>
            Resume Analyzer
          </button>
          
          <button onClick={() => navigate("/builder")} style={navButton(false)}>
            <div style={{ marginTop: 4 }}><Icons.ResumeBuilder /></div>
            Resume Builder
          </button>

          <button onClick={() => navigate("/coach")} style={navButton(false)}>
            <div style={{ marginTop: 4 }}><Icons.AICoach /></div>
            AI Coach
          </button>
          
          <button onClick={() => navigate("/interview")} style={navButton(false)}>
            <div style={{ marginTop: 4 }}><Icons.MockInterview /></div>
            Mock Interview
          </button>
        </nav>

        <div style={{ marginTop: "auto", fontSize: 13, color: THEME.muted }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Pro Tip</div>
          Use clear action verbs and group technologies per bullet.
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>AI Resume Analyzer</div>
            <div style={{ fontSize: 13, color: THEME.muted }}>Instant ATS score · actionable tips</div>
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

        {/* UPLOAD SECTION */}
        <section style={{ borderRadius: 14, padding: 18, background: "rgba(255,255,255,0.01)", border: `1px solid ${THEME.glass}`, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 84, height: 84, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "#04121a", fontSize: 34 }}>
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
              <button onClick={handleReset} style={ghostButton}>Reset</button>
            </div>
            {error && <div style={{ marginTop: 10, color: THEME.danger }}>{error}</div>}
          </div>
        </section>

        {/* RESULTS SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: 20 }}>
          {!result ? (
            <div style={{ gridColumn: "1 / -1", padding: 28, textAlign: "center", color: THEME.muted }}>
              Upload a resume to see your score.
            </div>
          ) : (
            <>
              {/* Score Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ borderRadius: 14, padding: 18, background: THEME.pane, border: `1px solid ${THEME.glass}` }}>
                 <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>Adjusted Score</div>
                    <GradeBadge score={adj} />
                 </div>
                 <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: THEME.accent1 }}>{adj}</div>
                    <div style={{ fontSize: 12, color: THEME.muted }}>/ 100</div>
                 </div>
                 <div style={{ display: "flex", gap: 10 }}>
                    <SmallStat title="Backend Score" value={backendScore} />
                    <SmallStat title="Projects" value={result.projects?.length || 0} />
                 </div>
              </motion.div>

              {/* Feedback Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ borderRadius: 14, padding: 20, background: THEME.pane, border: `1px solid ${THEME.glass}` }}>
                <h3 style={{ margin: "0 0 15px 0", fontSize: 18 }}>AI Feedback</h3>
                
                <h4 style={{ color: THEME.success, margin: "10px 0 5px" }}>✅ Strengths</h4>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {result.strengths?.length ? result.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>No specific strengths found.</li>}
                </ul>

                <h4 style={{ color: THEME.danger, margin: "15px 0 5px" }}>⚠️ Improvements</h4>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {result.weaknesses?.length ? result.weaknesses.map((w, i) => <li key={i}>{w}</li>) : <li>No specific weaknesses found.</li>}
                </ul>

                <h4 style={{ color: THEME.accent1, margin: "15px 0 5px" }}>💡 Tips</h4>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {result.tips?.length ? result.tips.map((t, i) => <li key={i}>{t}</li>) : <li>No tips available.</li>}
                </ul>

                <h4 style={{ color: THEME.accent2, margin: "15px 0 5px" }}>✍️ Suggested Bullets</h4>
                <div style={{ marginTop: 10 }}>
                   {result.suggested_bullets?.length ? result.suggested_bullets.map((b, i) => (
                      <div key={i} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.01)", marginBottom: 8, fontSize: 14 }}>{b}</div>
                   )) : <div style={{color: THEME.muted}}>No suggestions available.</div>}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* Styles */
const primaryButton = {
  background: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent1})`,
  color: "#042027", padding: "10px 14px", borderRadius: 12, border: "none", fontWeight: 800, cursor: "pointer"
};
const ghostButton = {
  background: "transparent", padding: "10px 12px", borderRadius: 10, border: `1px solid ${THEME.glass}`, color: THEME.muted, cursor: "pointer"
};

function navButton(active) {
  return {
    display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", borderRadius: 10, width: "100%",
    color: active ? THEME.accent1 : THEME.muted, background: active ? `${THEME.accent1}15` : "transparent",
    border: "none", cursor: "pointer", fontWeight: 700, textAlign: "left", fontSize: "14px"
  };
}