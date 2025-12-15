// ======================================================
// MockInterview.jsx — FINAL STABLE VERSION (PART 1 / 2)
// Backend-aligned, production-ready
// ======================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { jsPDF } from "jspdf";

import {
  LayoutDashboard,
  ClipboardCheck,
  PencilRuler,
  MessageSquare,
  BrainCircuit,
} from "lucide-react";

/* ===========================
   THEME
=========================== */
const PALETTE = {
  bg: "#020617",
  bgLight: "#0f172a",
  primary: "#15beff",
  secondary: "#9333ea",
  text: "#e2e8f0",
  textDim: "#94a3b8",
  border: "rgba(255,255,255,0.08)",
  success: "#10b981",
  error: "#ef4444",
};

const SIDEBAR_WIDTH = 260;

/* ===========================
   STYLES (unchanged layout)
=========================== */
const styles = {
  container: {
    minHeight: "100vh",
    background: PALETTE.bg,
    color: PALETTE.text,
    fontFamily: "'Inter', system-ui, Arial",
    display: "flex",
    overflow: "hidden",
  },
  sidebar: (hidden = false) => ({
    width: SIDEBAR_WIDTH,
    background: "linear-gradient(180deg, rgba(2,6,23,.96), rgba(2,6,23,.88))",
    borderRight: `1px solid ${PALETTE.border}`,
    padding: "1.5rem 1rem",
    transition: "all .35s ease",
    transform: hidden ? `translateX(-${SIDEBAR_WIDTH}px)` : "translateX(0)",
    opacity: hidden ? 0 : 1,
  }),
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  menuBtn: {
    display: "flex",
    gap: 10,
    padding: "0.7rem 0.9rem",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    color: PALETTE.textDim,
    cursor: "pointer",
    fontWeight: 600,
  },
  menuBtnActive: {
    background: "rgba(21,190,255,0.08)",
    color: PALETTE.primary,
  },
  glassCard: {
    background: "#071124",
    borderRadius: 12,
    border: `1px solid ${PALETTE.border}`,
    padding: 12,
  },
  primaryBtn: {
    padding: "0.85rem 1.2rem",
    borderRadius: 999,
    background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
    color: "#000",
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
  },
};

/* ===========================
   HOOKS
=========================== */
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
};

/* ===========================
   COMPONENT
=========================== */
export default function MockInterview() {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  /* ---------- CORE STATE ---------- */
  const [step, setStep] = useState("setup"); // setup | interview
  const [topic, setTopic] = useState("");
  const [experience, setExperience] = useState("Fresher (0-1 Years)");

  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 5;

  /* ---------- SUMMARY ---------- */
  const [history, setHistory] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [aiTips, setAiTips] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===========================
     BACKEND HELPERS
  =========================== */
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  /* ===========================
     START INTERVIEW
  =========================== */
  const startInterview = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setIsLoading(true);

    try {
      const skills = topic.split(",").map(s => s.trim());

      const res = await fetch("http://127.0.0.1:8000/mock/start", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          skills,
          experience,
        }),
      });

      const data = await res.json();

      setSessionId(data.session_id);
      setCurrentQuestion(data.first_question);
      setMessages([{ sender: "ai", text: data.first_question }]);
      setHistory([]);
      setQuestionCount(1);
      setStep("interview");
    } catch (err) {
      alert("Failed to start interview");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===========================
     SEND ANSWER
  =========================== */
  const sendAnswer = async () => {
    if (!input.trim() || !sessionId) return;

    const userAnswer = input;
    setInput("");
    setIsLoading(true);

    setMessages(prev => [...prev, { sender: "user", text: userAnswer }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/mock/answer", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          session_id: sessionId,
          question: currentQuestion,
          answer: userAnswer,
        }),
      });

      const data = await res.json();

      setHistory(prev => [
        ...prev,
        {
          question: currentQuestion,
          user_answer: userAnswer,
          score: data.score,
          feedback: data.feedback,
          improved_answer: data.improved_answer,
          skill: data.skill,
        },
      ]);

      setMessages(prev => [
        ...prev,
        { sender: "ai", text: `Score: ${data.score}/10\n${data.feedback}` },
      ]);

      if (data.next_question && questionCount < MAX_QUESTIONS) {
        setCurrentQuestion(data.next_question);
        setMessages(prev => [...prev, { sender: "ai", text: data.next_question }]);
        setQuestionCount(q => q + 1);
      } else {
        await fetchFinalReport();
      }
    } catch {
      alert("Answer evaluation failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===========================
     FINAL REPORT
  =========================== */
  const fetchFinalReport = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/mock/report/${sessionId}`,
      { headers: authHeader() }
    );

    const data = await res.json();

    setFinalScore(data.final_score);
    setAiTips(data.tips || []);
    setHistory(data.history || []);
    setShowSummary(true);

    if (data.final_score >= 8) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    }
  };

  /* ===========================
     EXPORT PDF
  =========================== */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("NextHire — Mock Interview Report", 14, 20);
    doc.text(`Topic: ${topic}`, 14, 30);
    doc.text(`Score: ${finalScore}/10`, 14, 38);
    doc.save("mock-interview-report.pdf");
  };
  /* ===========================
     RENDER
  =========================== */
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar(showSummary)}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NextHire
          </div>
          <div style={{ fontSize: 12, color: PALETTE.textDim }}>AI Coach</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={styles.menuBtn} onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button style={styles.menuBtn} onClick={() => navigate("/resume")}>
            <ClipboardCheck size={16} /> Resume Analyzer
          </button>
          <button style={styles.menuBtn} onClick={() => navigate("/builder")}>
            <PencilRuler size={16} /> Resume Builder
          </button>
          <button style={styles.menuBtn} onClick={() => navigate("/coach")}>
            <MessageSquare size={16} /> Interview Coach
          </button>
          <button style={{ ...styles.menuBtn, ...styles.menuBtnActive }}>
            <BrainCircuit size={16} /> Mock Interview
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {/* ================= SETUP ================= */}
        {step === "setup" && (
          <div style={{ padding: 28, maxWidth: 900 }}>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 34,
                fontWeight: 900,
                marginBottom: 16,
                background:
                  "linear-gradient(135deg,#15beff,#38bdf8,#a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Mock Interview
            </motion.h1>

            <div style={styles.glassCard}>
              <label style={{ fontSize: 12, color: PALETTE.textDim }}>
                Topics / Skills
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="React, Python, DSA, HR"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "0.8rem",
                  borderRadius: 10,
                  background: "#071122",
                  border: `1px solid ${PALETTE.border}`,
                  color: PALETTE.text,
                }}
              />

              <label
                style={{
                  fontSize: 12,
                  color: PALETTE.textDim,
                  marginTop: 12,
                  display: "block",
                }}
              >
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "0.7rem",
                  borderRadius: 10,
                  background: "#071122",
                  border: `1px solid ${PALETTE.border}`,
                  color: PALETTE.text,
                }}
              >
                <option>Fresher (0-1 Years)</option>
                <option>Intermediate (1-3 Years)</option>
                <option>Experienced (3-5 Years)</option>
                <option>Senior (5+ Years)</option>
              </select>

              <button
                onClick={startInterview}
                disabled={isLoading}
                style={{ ...styles.primaryBtn, marginTop: 18 }}
              >
                Start AI Interview →
              </button>
            </div>
          </div>
        )}

        {/* ================= INTERVIEW ================= */}
        {step === "interview" && (
          <div style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>
              Question {questionCount} / {MAX_QUESTIONS}
            </div>

            <div style={{ ...styles.glassCard, marginBottom: 12 }}>
              <strong>Question</strong>
              <div style={{ marginTop: 6, color: "#dbeafe" }}>
                {currentQuestion}
              </div>
            </div>

            <div style={{ ...styles.glassCard, flex: 1, overflowY: "auto" }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    alignSelf: m.sender === "ai" ? "flex-start" : "flex-end",
                    background:
                      m.sender === "ai"
                        ? PALETTE.bgLight
                        : `linear-gradient(135deg, ${PALETTE.primary}, #38bdf8)`,
                    color: m.sender === "ai" ? PALETTE.text : "#000",
                    padding: "0.8rem 1rem",
                    borderRadius: 10,
                    maxWidth: "80%",
                  }}
                >
                  {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAnswer()}
                placeholder="Type your answer…"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  borderRadius: 10,
                  background: "#071122",
                  border: `1px solid ${PALETTE.border}`,
                  color: PALETTE.text,
                }}
              />
              <button
                onClick={sendAnswer}
                disabled={isLoading}
                style={styles.primaryBtn}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* ================= SUMMARY ================= */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                style={{
                  width: "90%",
                  maxWidth: 1100,
                  height: "85vh",
                  background: PALETTE.bg,
                  borderRadius: 16,
                  padding: 20,
                  overflow: "hidden",
                }}
              >
                {showConfetti && (
                  <Confetti width={width} height={height} recycle={false} />
                )}

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h2>Interview Report</h2>
                    <div style={{ color: PALETTE.textDim }}>
                      Final Score: {finalScore}/10
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={exportPDF} style={styles.primaryBtn}>
                      Download PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowSummary(false);
                        setStep("setup");
                      }}
                      style={styles.menuBtn}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginTop: 14, height: "100%" }}>
                  <div style={{ ...styles.glassCard, overflowY: "auto" }}>
                    {history.map((h, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <strong>Q{i + 1}: {h.question}</strong>
                        <div style={{ fontSize: 13, marginTop: 4 }}>
                          <strong>Your answer:</strong> {h.user_answer}
                        </div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>
                          <strong>Better answer:</strong> {h.improved_answer}
                        </div>
                        <div style={{ color: PALETTE.primary, marginTop: 4 }}>
                          Score: {h.score}/10
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ ...styles.glassCard, overflowY: "auto" }}>
                    <strong>AI Improvement Tips</strong>
                    <ul style={{ marginTop: 10 }}>
                      {aiTips.map((t, i) => (
                        <li key={i} style={{ marginBottom: 8 }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
