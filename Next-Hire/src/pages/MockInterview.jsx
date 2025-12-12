// MockInterview.jsx
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
   PALETTE & BASE STYLES
   =========================== */
const PALETTE = {
  bg: "#020617",
  bgLight: "#0f172a",
  primary: "#15beff",
  secondary: "#9333ea",
  text: "#e2e8f0",
  textDim: "#94a3b8",
  border: "rgba(255, 255, 255, 0.08)",
  success: "#10b981",
  error: "#ef4444",
};

const SIDEBAR_WIDTH = 260;

const styles = {
  container: {
    minHeight: "100vh",
    background: PALETTE.bg,
    color: PALETTE.text,
    fontFamily: "'Inter', system-ui, Arial",
    display: "flex",
    overflow: "hidden",
  },
  // Sidebar (we will animate it out when modal is open)
  sidebar: (isHidden = false) => ({
    width: SIDEBAR_WIDTH,
    background: "linear-gradient(180deg, rgba(2,6,23,0.96), rgba(2,6,23,0.88))",
    backdropFilter: "blur(10px)",
    borderRight: `1px solid ${PALETTE.border}`,
    display: "flex",
    flexDirection: "column",
    padding: "1.5rem 1rem",
    zIndex: 5,
    transition: "transform 0.36s ease, opacity 0.28s ease",
    transform: isHidden ? `translateX(-${SIDEBAR_WIDTH + 12}px)` : "translateX(0)",
    opacity: isHidden ? 0.14 : 1,
    pointerEvents: isHidden ? "none" : "auto",
  }),
  main: { flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 2 },
  menuBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "0.7rem 0.9rem", border: "none", borderRadius: 10, cursor: "pointer", fontSize: "0.95rem", fontWeight: 500, background: "transparent", color: PALETTE.textDim },
  menuBtnActive: { background: `rgba(21,190,255,0.08)`, color: PALETTE.primary, boxShadow: `0 6px 18px rgba(21,190,255,0.06)` },

  // cards/buttons
  glassCard: { background: "#071124", borderRadius: 12, border: `1px solid ${PALETTE.border}`, padding: 12 },
  primaryBtn: { padding: "0.85rem 1.2rem", borderRadius: 999, background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondary})`, color: "#000", fontWeight: 800, cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 8 },

  // chat
  chatBox: { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 12, minHeight: 0 },
  messageBubble: { maxWidth: "80%", padding: "0.9rem 1rem", borderRadius: 10, lineHeight: 1.5, whiteSpace: "pre-wrap", position: "relative", fontSize: 14 },
  aiBubble: { alignSelf: "flex-start", background: PALETTE.bgLight, border: `1px solid ${PALETTE.border}`, color: PALETTE.text },
  userBubble: { alignSelf: "flex-end", background: `linear-gradient(145deg, ${PALETTE.primary}, #38bdf8)`, color: "#000", fontWeight: 700 },

  // inputs
  label: { display: "block", fontSize: 12, color: "#9ca3af", marginTop: 12, marginBottom: 6 },
  topicInput: { width: "100%", padding: "0.8rem 1rem", borderRadius: 10, border: `1px solid ${PALETTE.border}`, background: "#071122", color: PALETTE.text, outline: "none" },
  selectInput: { width: "100%", padding: "0.7rem 0.9rem", borderRadius: 10, border: `1px solid ${PALETTE.border}`, background: "#071122", color: PALETTE.text, outline: "none" },

  // summary card helper
  summaryQACard: { padding: 12, borderRadius: 12, background: "#071122", border: `1px solid ${PALETTE.border}` },

  // modal overlay (we override zIndex inline to be safely high)
  modalOverlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    background: "rgba(8,10,14,0.70)",
    backdropFilter: "blur(12px)",
  },
  modal: {
    width: "92%",
    maxWidth: 1200,
    height: "86vh",
    borderRadius: 16,
    background: "#020617",
    padding: 18,
    boxShadow: "0 40px 120px rgba(0,0,0,0.9)",
    border: `1px solid rgba(255,255,255,0.04)`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
};

/* ===========================
   small hooks (window-size & timer)
   =========================== */
const useWindowSize = () => {
  const [size, setSize] = useState({ width: typeof window !== "undefined" ? window.innerWidth : 1200, height: typeof window !== "undefined" ? window.innerHeight : 800 });
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
};

const useSessionTimer = (initialSeconds, onEnd) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const timerRef = useRef(null);

  const start = () => {
    const endTime = Date.now() + timeLeft * 1000;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        onEnd();
      }
    }, 1000);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const reset = () => {
    stop();
    setTimeLeft(initialSeconds);
  };

  return { timeLeft, start, stop, reset };
};

/* ===========================
   Component
   =========================== */
function MockInterview() {
  const navigate = useNavigate();

  // core
  const [step, setStep] = useState("setup");
  const [topic, setTopic] = useState("");
  const [experience, setExperience] = useState("Fresher (0-1 Years)");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [history, setHistory] = useState([]);
  const MAX_QUESTIONS = 5;

  // missing states (declared)
  const [typewriterSpeed, setTypewriterSpeed] = useState(12);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const { timeLeft: sessionTimeLeft, start: startTimer, stop: stopTimer, reset: resetTimer } = useSessionTimer(3600, () => generateSummary(history));

  const [sessions, setSessions] = useState([]);
  const [aiTips, setAiTips] = useState([]);

  const messagesEndRef = useRef(null);
  const evalAbortRef = useRef(null);

  const [revealed, setRevealed] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);

  const [userInfo] = useState({
    displayName: localStorage.getItem("username") || "User",
    userRole: localStorage.getItem("userRole") || "Candidate",
  });
  const initials = userInfo.displayName ? userInfo.displayName.substring(0, 2).toUpperCase() : "GU";

  /* === Effects === */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  useEffect(() => {
    try {
      const userKey = localStorage.getItem("userEmail") || localStorage.getItem("userId") || "guest";
      const raw = localStorage.getItem(`mockInterviewSessions_${userKey}`) || localStorage.getItem("mockInterviewSessions");
      if (raw) setSessions(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  /* === helpers === */
  const saveSessionToStorage = (session) => {
    try {
      const userKey = localStorage.getItem("userEmail") || localStorage.getItem("userId") || "guest";
      const storageKey = `mockInterviewSessions_${userKey}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const updated = [session, ...existing].slice(0, 50);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSessions(updated);
    } catch {
      // ignore
    }
  };

  const speakText = (text) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ""));
      u.rate = 1;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  };

  const formatSeconds = (secs) => {
    if (secs <= 0) return "00:00:00";
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const exportSessionPDF = (session) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("NextHire - Mock Interview Summary", 14, 20);
      doc.setFontSize(12);
      doc.text(`Topic: ${session.topic}`, 14, 30);
      doc.text(`Date: ${new Date(session.date).toLocaleString()}`, 14, 36);
      doc.text(`Average Score: ${session.finalScore}/10`, 14, 42);
      doc.save(`mock-interview-${session.topic}-${Date.now()}.pdf`);
    } catch {
      // ignore
    }
  };

  const makeProTips = (historyArr, rawTipsArr) => {
    const baseTips = rawTipsArr && rawTipsArr.length ? rawTipsArr : [];
    return historyArr
      .filter((item) => !(item.feedback || "").startsWith("System Error"))
      .map((item, idx) => {
        const title = `Focus area ${idx + 1}`;
        const shortFeedback = (item.feedback || "").split("\n")[0].replace(/^Score.*:/i, "").trim();
        const exampleText = item.improved_answer || baseTips[idx] || "";
        const example = exampleText.slice(0, 140) + (exampleText.length > 140 ? "..." : "");
        return {
          title,
          feedback: shortFeedback || "Give a clear definition, when to use it, and a tiny example.",
          example,
        };
      });
  };

  /* === flow functions === */
  const startInterview = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic!");
      return;
    }
    setStep("interview");
    setHistory([]);
    setQuestionCount(0);
    setAiTips([]);
    setMessages([
      {
        sender: "ai",
        text: `Great! I'll ask you ${MAX_QUESTIONS} questions about "${topic}" for a ${experience} level. You have 1 hour to complete this session. Let's begin...`,
        typed: true,
      },
    ]);
    resetTimer();
    startTimer();
    await fetchNextQuestion(topic, experience);
  };

  const fetchNextQuestion = async (interviewTopic, expLevel) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/get-interview-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: interviewTopic, experience: expLevel }),
      });
      if (!response.ok) throw new Error("Failed to fetch question");
      const data = await response.json();
      const rawQ = data.question || "";
      const displayQ = rawQ.replace(/\(Fallback question.*?\)/i, "").trim();

      setCurrentQuestion(displayQ);
      setMessages((prev) => [...prev, { sender: "ai", text: displayQ }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "ai", text: `Error getting question. Try again later.` }]);
    }
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userAnswer = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userAnswer }]);
    setIsLoading(true);

    try {
      if (evalAbortRef.current) {
        try {
          evalAbortRef.current.abort();
        } catch {}
      }
      const controller = new AbortController();
      evalAbortRef.current = controller;

      const response = await fetch("http://127.0.0.1:8000/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion, answer: userAnswer }),
        signal: controller.signal,
      });
      evalAbortRef.current = null;
      const result = await response.json();

      let feedbackText = result.feedback || "";
      if (feedbackText.startsWith("System Error")) {
        feedbackText = "The scoring engine was temporarily unavailable for this answer, so a default score was used. Focus on clarity and structure in your next response.";
      }

      const newHistoryItem = {
        question: currentQuestion,
        user_answer: userAnswer,
        score: result.score,
        feedback: result.feedback,
        improved_answer: result.improved_answer,
      };
      const updatedHistory = [...history, newHistoryItem];
      setHistory(updatedHistory);

      setMessages((prev) => [...prev, { sender: "ai", text: `Score: ${result.score}/10\n${feedbackText}` }]);

      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);

      if (nextCount >= MAX_QUESTIONS) {
        setTimeout(() => generateSummary(updatedHistory), 800);
      } else {
        setTimeout(() => fetchNextQuestion(topic, experience), 800);
      }
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", text: "Error evaluating answer." }]);
    }
    setIsLoading(false);
  };

  const replaySession = (session) => {
    if (!session) return;
    setTopic(session.topic || "");
    setAiTips(makeProTips(session.history || [], session.tips || []));
    setSelectedSession(session);
    setStep("summary");
    setShowSummaryModal(true);
  };

  const finalEndSession = () => {
    if (evalAbortRef.current) {
      try {
        evalAbortRef.current.abort();
      } catch {}
      evalAbortRef.current = null;
    }
    stopTimer();
    setMessages((prev) => [...prev, { sender: "ai", text: "🛑 Session ended by you. Generating report..." }]);
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), 4200);
    setTimeout(() => generateSummary(history), 900);
  };

  const undoEndSession = () => {
    setShowUndoToast(false);
    // optionally resume timer
    // startTimer();
  };

  const generateSummary = async (finalHistory) => {
    setStep("summary");
    setShowSummaryModal(true);
    const totalScore = finalHistory.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = finalHistory.length ? Math.round(totalScore / finalHistory.length) : 0;
    setFinalScore(avgScore);

    if (avgScore >= 8) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 7000);
    }

    let finalTips = [];
    try {
      const userEmail = localStorage.getItem("userEmail") || null;
      const resp = await fetch("http://127.0.0.1:8000/synthesize-session-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, history: finalHistory, email: userEmail }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.tips) && data.tips.length > 0) {
          finalTips = data.tips;
        }
      }
    } catch {
      // fallback — local tips
    }

    setAiTips(makeProTips(finalHistory, finalTips));

    const userEmail2 = localStorage.getItem("userEmail");
    if (userEmail2) {
      try {
        await fetch("http://127.0.0.1:8000/save-interview-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail2, topic: topic, score: avgScore, tips: finalTips }),
        });
      } catch {}
    }

    const sessionObj = {
      id: Date.now(),
      topic,
      date: new Date().toISOString(),
      finalScore: avgScore,
      history: finalHistory,
      tips: finalTips,
    };
    saveSessionToStorage(sessionObj);
    setSelectedSession(sessionObj);
  };

  /* ===========================
     Render
     =========================== */
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar(showSummaryModal)}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NextHire
          </div>
          <div style={{ fontSize: 12, color: PALETTE.textDim }}>AI Coach</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          <button style={styles.menuBtn} onClick={() => navigate("/dashboard")}><LayoutDashboard size={16} /> Dashboard</button>
          <button style={styles.menuBtn} onClick={() => navigate("/resume")}><ClipboardCheck size={16} /> Resume Analyzer</button>
          <button style={styles.menuBtn} onClick={() => navigate("/builder")}><PencilRuler size={16} /> Resume Builder</button>
          <button style={styles.menuBtn} onClick={() => navigate("/coach")}><MessageSquare size={16} /> Interview Coach</button>
          <button style={{ ...styles.menuBtn, ...styles.menuBtnActive }}><BrainCircuit size={16} /> Mock Interview</button>
        </nav>

        <div style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userInfo.displayName}</div>
            <div style={{ fontSize: 12, color: PALETTE.textDim }}>{userInfo.userRole}</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {/* SETUP */}
        {step === "setup" && (
          <div style={{ padding: 28 }}>
            <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ fontSize: 34, marginBottom: 18, fontWeight: 900, background: "linear-gradient(135deg,#15beff,#38bdf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI Mock Interview
            </motion.h1>

            <div style={{ maxWidth: 860, background: "#071124", padding: 20, borderRadius: 14, border: `1px solid ${PALETTE.border}` }}>
              <label style={styles.label}>Select Topic</label>
              <input style={styles.topicInput} placeholder="e.g., React, Python, DSA, HR..." value={topic} onChange={(e) => setTopic(e.target.value)} />

              <label style={styles.label}>Experience Level</label>
              <select style={styles.selectInput} value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option>Fresher (0-1 Years)</option>
                <option>Intermediate (1-3 Years)</option>
                <option>Experienced (3-5 Years)</option>
                <option>Senior (5+ Years)</option>
              </select>

              <label style={styles.label}>AI Typing Speed</label>
              <select value={typewriterSpeed} onChange={(e) => setTypewriterSpeed(Number(e.target.value))} style={{ ...styles.selectInput, width: 240 }}>
                <option value={24}>Slow</option>
                <option value={12}>Normal</option>
                <option value={6}>Fast</option>
              </select>

              <div style={{ marginTop: 16 }}>
                <button style={{ ...styles.primaryBtn, width: 220 }} onClick={startInterview}>Start AI Interview ➤</button>
              </div>
            </div>
          </div>
        )}

        {/* INTERVIEW */}
        {step === "interview" && (
          <div style={{ padding: 18, display: "flex", gap: 12, flexDirection: "column", height: "100%" }}>
            {/* header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Topic: {topic} <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: 8 }}>({experience})</span></div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>Mock interview — {MAX_QUESTIONS} questions · AI scoring, feedback & tips</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#9ca3af", background: "#0b1220", padding: "6px 10px", borderRadius: 999 }}>{Math.min(questionCount + 1, MAX_QUESTIONS)} / {MAX_QUESTIONS}</div>
              </div>
            </div>

            {/* main grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, flex: 1, minHeight: 0 }}>
              {/* left */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...styles.glassCard, minHeight: 120 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Question</div>
                  <div style={{ fontSize: 16, color: "#dbeafe", lineHeight: 1.5 }}>{currentQuestion || (messages.length > 0 ? messages[messages.length - 1].text : "Waiting for the question...")}</div>
                </div>

                <div style={{ ...styles.glassCard, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Conversation</div>
                  <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 8 }}>
                    <div style={styles.chatBox}>
                      {messages.map((msg, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.14 }}>
                          <div style={{ ...styles.messageBubble, ...(msg.sender === "ai" ? styles.aiBubble : styles.userBubble) }}>
                            <div style={{ position: "relative" }}>
                              {msg.text.split("**").map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}
                              <button onClick={() => speakText(msg.text)} title="Read aloud" style={{ position: "absolute", right: 8, top: 6, background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}>🔊</button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>
              </div>

              {/* right */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...styles.glassCard }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Session Controls</div>
                  <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>Question {Math.min(questionCount + 1, MAX_QUESTIONS)} of {MAX_QUESTIONS}</div>
                  <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={isLoading ? "Thinking..." : "Type your answer..."} onKeyDown={(e) => e.key === "Enter" && handleSend()} style={{ width: "100%", padding: "0.85rem 0.9rem", borderRadius: 10, border: `1px solid ${PALETTE.border}`, background: "#071122", color: PALETTE.text, outline: "none", marginBottom: 8 }} disabled={isLoading} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleSend} style={{ ...styles.primaryBtn, flex: 1 }} disabled={isLoading}>Submit Answer</button>
                    <button onClick={() => { setInput(""); setMessages((prev) => [...prev, { sender: "ai", text: "Skipping this question...", typed: true }]); setTimeout(() => fetchNextQuestion(topic, experience), 700); }} style={{ padding: "0.6rem", borderRadius: 10, border: "none", background: "#0b1220", color: PALETTE.primary }}>↻</button>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button onClick={finalEndSession} style={{ padding: "0.6rem 0.8rem", borderRadius: 10, background: PALETTE.error, color: "#fff", border: "none", width: "100%", fontWeight: 700 }}>End Session</button>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ height: 8, background: "#071122", borderRadius: 8, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", background: "linear-gradient(90deg,#15beff,#9333ea)" }} />
                    </div>
                  </div>
                </div>

                <div style={{ ...styles.glassCard, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Quick AI Tips</div>
                  <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>Short suggestions from this session.</div>
                  <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {(aiTips.length ? aiTips : []).slice(0, 6).map((t, i) => (
                      <div key={i} style={{ padding: 10, borderRadius: 10, background: "linear-gradient(180deg, rgba(21,190,255,0.06), rgba(147,51,234,0.04))", color: "#e5eefc" }}>
                        <div style={{ fontWeight: 800 }}>{t.title}</div>
                        <div style={{ fontSize: 13, color: "#cfe8ff", marginTop: 6 }}>{t.feedback}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}><strong>Pro example:</strong> {t.example}</div>
                      </div>
                    ))}
                    {aiTips.length === 0 && <div style={{ color: "#6b7280" }}>Tips will appear after you answer some questions.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY MODAL */}
        <AnimatePresence>
          {showSummaryModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.modalOverlay}>
              <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} transition={{ duration: 0.32 }} style={styles.modal}>
                {/* confetti */}
                {showConfetti && <Confetti width={windowWidth} height={windowHeight} recycle={false} />}

                {/* header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>Interview Report</div>
                    <div style={{ color: "#9ca3af", marginTop: 6 }}>{topic} · {history.length} question(s)</div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 84, height: 84, display: "grid", placeItems: "center", borderRadius: 12, background: "#071124", border: `1px solid ${PALETTE.border}` }}>
                      <svg viewBox="0 0 36 36" width="64" height="64">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#071122" strokeWidth="3" />
                        <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={finalScore >= 8 ? PALETTE.success : PALETTE.primary} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: Math.min(finalScore / 10, 1) }} transition={{ duration: 0.8 }} />
                        <text x="18" y="20.6" fontSize="6.5" textAnchor="middle" fill="#e5e7eb">{finalScore ?? 0}/10</text>
                      </svg>
                    </div>

                    <button onClick={() => { setShowSummaryModal(false); setStep("setup"); }} style={{ padding: "0.55rem 0.9rem", borderRadius: 999, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#e5e7eb", cursor: "pointer" }}>Close</button>
                  </div>
                </div>

                {/* body grid */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, flex: 1, minHeight: 0 }}>
                  {/* left: Q&A list */}
                  <div style={{ ...styles.glassCard, overflowY: "auto", minHeight: 0 }}>
                    {history.length === 0 && <div style={{ color: "#9ca3af" }}>No questions answered in this session.</div>}
                    {history.map((item, idx) => (
                      <div key={idx} style={{ ...styles.summaryQACard, marginBottom: 12 }}>
                        <div style={{ fontWeight: 800, color: "#e5eefc", marginBottom: 6 }}>Q{idx + 1}. {item.question}</div>
                        <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>Your Answer</div>
                        <div style={{ color: "#e5eefc", fontSize: 14, marginBottom: 8 }}>{item.user_answer || "No answer"}</div>
                        <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>Better Answer</div>
                        <div style={{ color: "#dbeafe", fontSize: 14 }}>{item.improved_answer}</div>
                        <div style={{ marginTop: 10, fontSize: 13, color: item.score >= 8 ? PALETTE.success : PALETTE.primary }}>Score: {item.score}/10</div>
                      </div>
                    ))}
                  </div>

                  {/* right: tips */}
                  <div style={{ ...styles.glassCard, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>Tips to Improve</div>
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>Generated from your answers using your backend AI.</div>

                    <div style={{ overflowY: "auto", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {aiTips && aiTips.length > 0 ? (
                        aiTips.map((tip, i) => (
                          <div key={i} style={{ padding: 12, borderRadius: 12, background: "linear-gradient(180deg, rgba(21,190,255,0.06), rgba(147,51,234,0.04))" }}>
                            <div style={{ fontWeight: 800, marginBottom: 8 }}>{tip.title}</div>
                            <div style={{ color: "#d1d5db", marginBottom: 8 }}>{tip.feedback}</div>
                            <div style={{ fontSize: 13, color: "#9ca3af" }}><strong>Pro example:</strong> {tip.example}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: "#9ca3af" }}>Tips will appear once at least one question is answered.</div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button onClick={() => { setShowSummaryModal(false); startInterview(); }} style={{ ...styles.primaryBtn, flex: 1 }}>Restart with same topic</button>
                      <button onClick={() => { setShowSummaryModal(false); setStep("setup"); }} style={{ padding: "0.6rem 0.9rem", borderRadius: 999, background: "#111827", color: "#e5e7eb", border: "1px solid #1f2937", cursor: "pointer", flex: 1 }}>Back to setup</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Undo toast */}
        <AnimatePresence>
          {showUndoToast && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 12000, background: "#020617", borderRadius: 999, padding: "10px 14px", border: `1px solid ${PALETTE.border}`, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ color: "#e5e7eb" }}>Session ending…</span>
              <button onClick={undoEndSession} style={{ border: "none", background: "transparent", color: "#38bdf8", cursor: "pointer", fontWeight: 800 }}>Undo</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default MockInterview;
