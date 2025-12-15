// ======================================================
// MockInterview.jsx — FINAL INTEGRATED VERSION
// Authentic Sidebar + High-End Interview Engine
// ======================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { jsPDF } from "jspdf";
import {
  // Sidebar Icons
  LayoutDashboard,
  FileText,
  Wrench,
  GraduationCap,
  Video,
  // Interview Icons
  BrainCircuit,
  Send,
  Zap,
  Clock,
  StopCircle,
  History,
  Trophy,
  Download,
  Target,
  User,
  Bot,
  Loader2,
  Sparkles
} from "lucide-react";

/* ===========================
   THEME & CONSTANTS
=========================== */
const PALETTE = {
  bg: "#020617",         // Deepest Slate (Main Background)
  sidebarBg: "#0f172a",  // Sidebar Background
  card: "rgba(30, 41, 59, 0.7)", // Glassy Card
  primary: "#0ea5e9",    // Sky Blue (Brand Color)
  secondary: "#8b5cf6",  // Violet
  accent: "#f59e0b",     // Amber
  text: "#f8fafc",
  textDim: "#94a3b8",
  border: "rgba(255, 255, 255, 0.08)",
  activeItem: "rgba(14, 165, 233, 0.15)", // Sidebar Active BG
  activeBorder: "#0ea5e9", // Sidebar Active Border
};

const TOTAL_TIME = 3600; // 1 Hour
const MAX_QUESTIONS = 5;

/* ===========================
   ANIMATIONS
=========================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

/* ===========================
   COMPONENT
=========================== */
export default function MockInterview() {
  const navigate = useNavigate();

  // --- CORE STATE ---
  const [step, setStep] = useState("setup"); // setup | interview | report
  const [isLoading, setIsLoading] = useState(false);
  
  // --- USER INPUT ---
  const [topic, setTopic] = useState("");
  const [experience, setExperience] = useState("Fresher (0-1 Years)");
  
  // --- SESSION STATE ---
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [input, setInput] = useState("");
  
  // --- TIMER & HISTORY ---
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [pastSessions, setPastSessions] = useState([]);
  
  // --- REPORT DATA ---
  const [currentHistory, setCurrentHistory] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  
  const messagesEndRef = useRef(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // --- INITIALIZATION ---
  useEffect(() => {
    const saved = localStorage.getItem("mock_interview_history");
    if (saved) setPastSessions(JSON.parse(saved));

    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let timer;
    if (step === "interview" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && step === "interview") {
      finishInterview();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ===========================
     FUNCTIONS
  =========================== */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const saveSessionLocally = (reportData) => {
    const sessionData = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      topic: topic,
      score: reportData.final_score,
      details: reportData
    };
    const updatedHistory = [sessionData, ...pastSessions];
    setPastSessions(updatedHistory);
    localStorage.setItem("mock_interview_history", JSON.stringify(updatedHistory));
  };

  const authHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}` 
  });

  const startInterview = async () => {
    if (!topic.trim()) return alert("Please enter a topic.");
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/mock/start", {
        method: "POST", headers: authHeader(),
        body: JSON.stringify({ skills: topic.split(","), experience }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setCurrentQuestion(data.first_question);
      setMessages([{ sender: "ai", text: data.first_question }]);
      setCurrentHistory([]);
      setQuestionCount(1);
      setTimeLeft(TOTAL_TIME);
      setStep("interview");
    } catch (e) { alert("Failed to start."); } 
    finally { setIsLoading(false); }
  };

  const sendAnswer = async () => {
    if (!input.trim()) return;
    const ans = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: ans }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/mock/answer", {
        method: "POST", headers: authHeader(),
        body: JSON.stringify({ session_id: sessionId, question: currentQuestion, answer: ans }),
      });
      const data = await res.json();

      setCurrentHistory(prev => [...prev, {
        question: currentQuestion, user_answer: ans, feedback: data.feedback,
        score: data.score, improved_answer: data.improved_answer
      }]);

      setMessages((prev) => [...prev, { sender: "ai", text: data.feedback, isFeedback: true, score: data.score }]);

      if (data.next_question && questionCount < MAX_QUESTIONS) {
        setTimeout(() => {
          setCurrentQuestion(data.next_question);
          setMessages((prev) => [...prev, { sender: "ai", text: data.next_question }]);
          setQuestionCount((p) => p + 1);
          setIsLoading(false);
        }, 1200);
      } else {
        setTimeout(() => finishInterview(), 1500);
      }
    } catch (e) { setIsLoading(false); }
  };

  const finishInterview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/mock/report/${sessionId}`, { headers: authHeader() });
      const data = await res.json();
      setFinalReport(data);
      saveSessionLocally(data);
      setStep("report");
    } catch (e) { alert("Report failed."); } 
    finally { setIsLoading(false); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`NextHire Report - ${topic}`, 14, 20);
    doc.text(`Score: ${finalReport?.final_score}/10`, 14, 30);
    doc.save("NextHire_Report.pdf");
  };

  /* ===========================
     STYLES
  =========================== */
  const styles = {
    layout: {
      display: "flex",
      minHeight: "100vh",
      background: PALETTE.bg,
      color: PALETTE.text,
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden"
    },
    sidebar: {
      width: 270,
      background: PALETTE.sidebarBg,
      borderRight: `1px solid ${PALETTE.border}`,
      display: "flex",
      flexDirection: "column",
      padding: "24px 16px",
      zIndex: 50,
      flexShrink: 0,
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 40,
      paddingLeft: 8
    },
    logoBox: {
      width: 40, 
      height: 40, 
      background: `linear-gradient(135deg, ${PALETTE.primary}, #3b82f6)`,
      borderRadius: 8, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)"
    },
    menuLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: PALETTE.textDim,
      marginBottom: 12,
      paddingLeft: 12,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    menuBtn: {
      display: "flex", 
      alignItems: "center",
      gap: 12, 
      padding: "12px 16px", 
      borderRadius: 12,
      border: "none", 
      background: "transparent", 
      color: "#94a3b8",
      cursor: "pointer", 
      fontWeight: 500, 
      fontSize: 14, 
      width: "100%",
      textAlign: "left",
      transition: "all 0.2s ease"
    },
    menuBtnActive: {
      background: PALETTE.activeItem, 
      color: "#38bdf8",
      fontWeight: 600,
      borderLeft: `4px solid ${PALETTE.activeBorder}`,
      boxShadow: "0 0 15px rgba(14, 165, 233, 0.1)"
    },
    main: {
      flex: 1,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  };

  /* ===========================
     RENDER
  =========================== */
  return (
    <div style={styles.layout}>
      
      {/* ================= SIDEBAR ================= */}
      <aside style={styles.sidebar}>
        {/* LOGO */}
        <div style={styles.logoContainer}>
            <div style={styles.logoBox}>
                <BrainCircuit size={24} color="white" /> 
            </div>
            <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
                  NextHire
                </div>
                <div style={{ fontSize: 10, color: PALETTE.textDim, letterSpacing: 1.5, fontWeight: 600 }}>
                  CANDIDATE
                </div>
            </div>
        </div>

        {/* MENU */}
        <div style={styles.menuLabel}>Menu</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button style={styles.menuBtn} onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button style={styles.menuBtn} onClick={() => navigate("/resume-analyzer")}>
            <FileText size={20} /> Resume Analyzer
          </button>
          <button style={styles.menuBtn} onClick={() => navigate("/resume-builder")}>
            <Wrench size={20} /> Resume Builder
          </button>
          <button style={styles.menuBtn} onClick={() => navigate("/coach")}>
            <GraduationCap size={20} /> AI Coach
          </button>
          
          {/* ACTIVE STATE FOR MOCK INTERVIEW */}
          <button style={{ ...styles.menuBtn, ...styles.menuBtnActive }}>
            <Video size={20} /> Mock Interview
          </button>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main style={styles.main}>
        
        {/* Background Animation (Confined to Main) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", top: "-20%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(14, 165, 233, 0.08), transparent 70%)", borderRadius: "50%" }} 
            />
        </div>

        {/* Header */}
        <header style={{ 
          padding: "1rem 2rem", 
          borderBottom: `1px solid ${PALETTE.border}`, 
          backdropFilter: "blur(10px)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          zIndex: 10 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color={PALETTE.primary} />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "white", margin: 0 }}>AI Mock Interview</h2>
          </div>
          
          {step === "interview" && (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(245, 158, 11, 0.1)", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                <Clock size={16} color={PALETTE.accent} />
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: PALETTE.accent }}>{formatTime(timeLeft)}</span>
              </div>
              <button onClick={() => finishInterview()} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s" }}>
                <StopCircle size={16} /> End Now
              </button>
            </div>
          )}
        </header>

        {/* Dynamic Content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", zIndex: 10 }}>
          <AnimatePresence mode="wait">
            
            {/* --- 1. SETUP STEP --- */}
            {step === "setup" && (
              <motion.div key="setup" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 320px", padding: 40, gap: 40, overflowY: "auto" }}>
                
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <motion.div variants={itemVariants}>
                    <h1 style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
                      Master Your <br/> <span style={{ color: PALETTE.primary }}>Technical Interview.</span>
                    </h1>
                    <p style={{ color: PALETTE.textDim, fontSize: "1.1rem", marginBottom: 40, maxWidth: 600 }}>
                       Simulate a real-world interview environment. Receive instant AI feedback on your answers and track your progress over time.
                    </p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} style={{ background: PALETTE.card, padding: 32, borderRadius: 24, border: `1px solid ${PALETTE.border}`, backdropFilter: "blur(12px)" }}>
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", color: PALETTE.primary, fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Target Role / Stack</label>
                      <input 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)} 
                        placeholder="e.g. React Developer, Data Scientist, System Design" 
                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: 16, borderRadius: 12, color: "white", outline: "none", fontSize: 16 }} 
                      />
                    </div>
                    <div style={{ marginBottom: 32 }}>
                      <label style={{ display: "block", color: PALETTE.primary, fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Experience Level</label>
                      <select 
                        value={experience} 
                        onChange={(e) => setExperience(e.target.value)} 
                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: 16, borderRadius: 12, color: "white", outline: "none", fontSize: 16 }}
                      >
                        <option>Fresher (0-1 Years)</option>
                        <option>Intermediate (1-3 Years)</option>
                        <option>Experienced (3-5 Years)</option>
                        <option>Senior (5+ Years)</option>
                      </select>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={startInterview} 
                      disabled={isLoading} 
                      style={{ width: "100%", padding: 18, background: `linear-gradient(135deg, ${PALETTE.primary}, #3b82f6)`, border: "none", borderRadius: 12, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)" }}
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : <><Zap size={20} fill="white" /> Start Simulation</>}
                    </motion.button>
                  </motion.div>
                </div>

                {/* History Panel */}
                <motion.div variants={itemVariants} style={{ background: "rgba(15, 23, 42, 0.6)", borderLeft: `1px solid ${PALETTE.border}`, borderRadius: 24, padding: 24, overflowY: "auto" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, fontSize: 16 }}>
                    <History size={18} color={PALETTE.textDim} /> Past Sessions
                  </h3>
                  {pastSessions.length === 0 ? <div style={{ color: PALETTE.textDim, fontSize: 13, textAlign: "center", marginTop: 40 }}>No history yet.</div> : 
                    pastSessions.map(s => (
                      <div key={s.id} style={{ padding: 16, marginBottom: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{s.topic}</span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: s.score >= 8 ? "#4ade80" : "#facc15" }}>{s.score}/10</span>
                        </div>
                        <div style={{ fontSize: 12, color: PALETTE.textDim }}>{s.date}</div>
                      </div>
                    ))
                  }
                </motion.div>
              </motion.div>
            )}

            {/* --- 2. INTERVIEW STEP --- */}
            {step === "interview" && (
              <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: "100%", display: "flex", flexDirection: "column", maxWidth: 900, margin: "0 auto", padding: "20px" }}>
                 <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: PALETTE.textDim, marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
                    <span>Progress</span><span>Question {questionCount} / {MAX_QUESTIONS}</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }} style={{ height: "100%", background: PALETTE.primary }} />
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", paddingRight: 10, display: "flex", flexDirection: "column", gap: 24 }}>
                  {messages.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "80%", display: "flex", flexDirection: m.sender === "user" ? "row-reverse" : "row", gap: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.sender === "ai" ? PALETTE.primary : PALETTE.secondary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                        {m.sender === "ai" ? <Bot size={20} color="white" /> : <User size={20} color="white" />}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: m.sender === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{ padding: "14px 20px", borderRadius: 18, background: m.sender === "ai" ? "rgba(30, 41, 59, 0.8)" : `linear-gradient(135deg, ${PALETTE.primary}, #3b82f6)`, border: `1px solid ${m.sender === "ai" ? PALETTE.border : "transparent"}`, color: "white", lineHeight: 1.6, fontSize: 15 }}>
                            {m.text}
                        </div>
                        {m.isFeedback && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: m.score >= 7 ? "#4ade80" : "#facc15", display: "flex", alignItems: "center", gap: 4 }}>
                                <Target size={14} /> Score: {m.score}/10
                            </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                     <div style={{ display: "flex", gap: 10, paddingLeft: 52 }}>
                        <div style={{ width: 8, height: 8, background: PALETTE.textDim, borderRadius: "50%", animation: "pulse 1s infinite" }}></div>
                        <div style={{ width: 8, height: 8, background: PALETTE.textDim, borderRadius: "50%", animation: "pulse 1s infinite", animationDelay: "0.2s" }}></div>
                        <div style={{ width: 8, height: 8, background: PALETTE.textDim, borderRadius: "50%", animation: "pulse 1s infinite", animationDelay: "0.4s" }}></div>
                     </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ marginTop: 24, position: "relative" }}>
                  <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAnswer())} 
                    placeholder="Type your answer here..." 
                    style={{ width: "100%", background: "rgba(15, 23, 42, 0.8)", border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: "18px 60px 18px 20px", color: "white", resize: "none", height: 64, outline: "none", fontSize: 16, backdropFilter: "blur(10px)" }} 
                  />
                  <button 
                    onClick={sendAnswer} 
                    disabled={isLoading || !input.trim()} 
                    style={{ position: "absolute", right: 12, top: 12, width: 40, height: 40, borderRadius: 10, background: input.trim() ? PALETTE.primary : "rgba(255,255,255,0.05)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s" }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- 3. REPORT STEP --- */}
            {step === "report" && (
              <motion.div key="report" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={{ height: "100%", maxWidth: 800, margin: "0 auto", padding: 40, overflowY: "auto", textAlign: "center" }}>
                {finalReport?.final_score >= 8 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}
                
                <div style={{ marginBottom: 40 }}>
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ width: 80, height: 80, margin: "0 auto 24px", background: `linear-gradient(135deg, ${PALETTE.primary}, #3b82f6)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(14, 165, 233, 0.4)" }}
                    >
                        <Trophy size={40} color="white" />
                    </motion.div>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>Session Complete</h2>
                    <p style={{ color: PALETTE.textDim, marginTop: 8 }}>Here is how you performed.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
                    <div style={{ background: PALETTE.card, padding: 32, borderRadius: 20, border: `1px solid ${PALETTE.border}` }}>
                        <div style={{ color: PALETTE.textDim, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>FINAL SCORE</div>
                        <div style={{ fontSize: "4rem", fontWeight: 800, color: finalReport?.final_score >= 8 ? "#4ade80" : "#facc15", lineHeight: 1.2 }}>
                            {finalReport?.final_score}<span style={{fontSize: "1.5rem", color: PALETTE.textDim}}>/10</span>
                        </div>
                    </div>
                    <div style={{ background: PALETTE.card, padding: 32, borderRadius: 20, border: `1px solid ${PALETTE.border}`, textAlign: "left" }}>
                        <div style={{ color: PALETTE.textDim, fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>FEEDBACK & TIPS</div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                            {finalReport?.tips?.slice(0, 3).map((tip, i) => <li key={i} style={{ marginBottom: 8 }}>{tip}</li>)}
                        </ul>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                    <button onClick={downloadPDF} style={{ padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.08)", color: "white", border: "none", fontWeight: 600, display: "flex", gap: 8, alignItems: "center", cursor: "pointer", transition: "background 0.2s" }}><Download size={18} /> Download PDF</button>
                    <button onClick={() => setStep("setup")} style={{ padding: "14px 28px", borderRadius: 12, background: PALETTE.primary, color: "white", border: "none", fontWeight: 600, display: "flex", gap: 8, alignItems: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)" }}><Target size={18} /> Practice Again</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}