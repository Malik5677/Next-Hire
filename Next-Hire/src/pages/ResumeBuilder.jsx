// ============================================================================
// PROJECT: NEXTHIRE — ULTIMATE RESUME BUILDER (PRO)
// Features: Glassmorphism, Framer Motion, Smart Layouts, PDF Export
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { 
  // Editor Icons
  Bold, Italic, Underline, Strikethrough, Type, Highlighter, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Indent, Outdent, 
  Image as ImageIcon, Link as LinkIcon, 
  Undo, Redo, Printer, Minus, Plus, 
  // UI Icons
  ChevronDown, ArrowLeft, Settings, Download, Share2, 
  Cloud, Globe, FileText, Layout, CheckCircle, 
  MoreHorizontal, Sparkles, Sidebar as SidebarIcon, X
} from 'lucide-react';

/* ===========================
   THEME & CONSTANTS
=========================== */
const THEME = {
  bg: "#09090b",       // Deep Zinc Black
  sidebar: "#18181b",  // Zinc 900
  paper: "#ffffff",
  accent: "#3b82f6",   // Bright Blue
  accentGlow: "0 0 20px rgba(59, 130, 246, 0.5)",
  text: "#f4f4f5",
  textDim: "#a1a1aa",
  border: "rgba(255, 255, 255, 0.1)",
  glass: "rgba(24, 24, 27, 0.7)", // Backdrop blur effect
  fontUI: "'Inter', sans-serif",
};

const PAGE_SIZES = {
  a4: { width: "210mm", height: "297mm", label: "A4 (International)" },
  letter: { width: "8.5in", height: "11in", label: "US Letter" }
};

const FONTS = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Roboto", "Open Sans"];

/* ===========================
   ANIMATION VARIANTS
=========================== */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 }
};

const cardHover = {
  hover: { y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.4)", scale: 1.02 }
};

/* ===========================
   TEMPLATES DATA
=========================== */
const TEMPLATES = [
  { id: "blank", name: "Blank Canvas", desc: "Start from scratch.", color: "#27272a" },
  { id: "swiss", name: "Swiss Modern", desc: "Clean, bold typography.", color: "#e0e7ff" },
  { id: "executive", name: "Executive", desc: "Traditional & serif.", color: "#fef3c7" },
  { id: "tech", name: "Tech Lead", desc: "Monospace accents.", color: "#d1fae5" },
];

// Helper to generate initial HTML based on template
const getTemplateHTML = (id) => {
  const dummyText = `<p>Start typing your professional story...</p>`;
  const header = (title, font) => `<h1 style="font-family: ${font}; font-size: 28pt; border-bottom: 2px solid #333; padding-bottom: 10px;">YOUR NAME</h1>`;
  
  switch(id) {
    case 'swiss': return `<div style="font-family: Arial;">${header('YOUR NAME', 'Arial')}<p><strong>SENIOR DEVELOPER</strong></p>${dummyText}</div>`;
    case 'executive': return `<div style="font-family: Georgia;">${header('YOUR NAME', 'Georgia')}<p><i>Executive Director</i></p>${dummyText}</div>`;
    case 'tech': return `<div style="font-family: 'Courier New';">${header('<YOUR_NAME />', 'Courier New')}<p>// Full Stack Engineer</p>${dummyText}</div>`;
    default: return `<div style="font-family: Arial;">${header('Your Name', 'Arial')}${dummyText}</div>`;
  }
};

/* ===========================
   COMPONENTS
=========================== */

// 1. Toolbar Button (Animated)
const ToolBtn = ({ icon, active, onClick, title }) => (
  <motion.button
    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    title={title}
    style={{
      padding: "8px",
      borderRadius: "8px",
      border: "none",
      background: active ? "rgba(59, 130, 246, 0.2)" : "transparent",
      color: active ? THEME.accent : THEME.textDim,
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}
  >
    {icon}
  </motion.button>
);

// 2. Divider
const Divider = () => <div style={{ width: 1, height: 24, background: THEME.border, margin: "0 8px" }} />;

// ===========================
// MAIN COMPONENT
// ===========================
export default function ResumeBuilder() {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  // --- STATE ---
  const [view, setView] = useState("dashboard"); // dashboard | editor
  const [docTitle, setDocTitle] = useState("Untitled Resume");
  const [lastSaved, setLastSaved] = useState("Just now");
  const [zoom, setZoom] = useState(100);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Editor State
  const [activeFormats, setActiveFormats] = useState({});
  const [stats, setStats] = useState({ words: 0, chars: 0 });

  // --- FORMATTING LOGIC ---
  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    checkFormats();
    editorRef.current.focus();
  };

  const checkFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
    });
    updateStats();
  };

  const updateStats = () => {
    if(!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setStats({
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      chars: text.length
    });
    setLastSaved("Saving...");
    setTimeout(() => setLastSaved("Saved"), 800);
  };

  const loadTemplate = (tpl) => {
    setDocTitle(tpl.name);
    setView("editor");
    setTimeout(() => {
      if(editorRef.current) editorRef.current.innerHTML = getTemplateHTML(tpl.id);
    }, 100);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = editorRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${docTitle}.pdf`);
    setIsExporting(false);
  };

  /* ===========================
     VIEW: DASHBOARD
  =========================== */
  const renderDashboard = () => (
    <div style={{ minHeight: "100vh", background: THEME.bg, color: THEME.text, fontFamily: THEME.fontUI, padding: "40px" }}>
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 60 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div style={{ width: 45, height: 45, borderRadius: 12, background: `linear-gradient(135deg, ${THEME.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: THEME.accentGlow }}>
            <FileText color="white" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Resume Builder</h1>
            <p style={{ margin: 0, color: THEME.textDim, fontSize: 14 }}>Workspace / My Documents</p>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${THEME.border}`, padding: "10px 20px", borderRadius: 10, color: "white", cursor: "pointer" }}>Back to Hub</button>
      </motion.div>

      {/* Hero */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ textAlign: "center", marginBottom: 60 }}
      >
        <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Create your next opportunity.
        </h2>
        <p style={{ fontSize: 18, color: THEME.textDim }}>Select a professional template to get started.</p>
      </motion.div>

      {/* Template Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 30, maxWidth: 1200, margin: "0 auto" }}>
        {TEMPLATES.map((t, i) => (
          <motion.div
            key={t.id}
            variants={cardHover}
            whileHover="hover"
            onClick={() => loadTemplate(t)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            style={{ 
              background: "#18181b", 
              borderRadius: 20, 
              border: `1px solid ${THEME.border}`, 
              overflow: "hidden", 
              cursor: "pointer",
              position: "relative"
            }}
          >
            {/* Preview Area */}
            <div style={{ height: 200, background: t.color, position: "relative", padding: 20 }}>
              <div style={{ width: "100%", height: "100%", background: "white", borderRadius: 4, boxShadow: "0 10px 20px rgba(0,0,0,0.1)", padding: 15, opacity: 0.9 }}>
                <div style={{ width: "40%", height: 8, background: "#333", marginBottom: 10 }} />
                <div style={{ width: "80%", height: 4, background: "#ccc", marginBottom: 5 }} />
                <div style={{ width: "70%", height: 4, background: "#ccc", marginBottom: 20 }} />
                <div style={{ width: "30%", height: 6, background: "#666", marginBottom: 8 }} />
                <div style={{ width: "90%", height: 4, background: "#ddd", marginBottom: 4 }} />
                <div style={{ width: "90%", height: 4, background: "#ddd", marginBottom: 4 }} />
              </div>
              <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 10, backdropFilter: "blur(4px)" }}>PREVIEW</div>
            </div>
            {/* Info Area */}
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px 0" }}>{t.name}</h3>
              <p style={{ fontSize: 13, color: THEME.textDim, margin: 0 }}>{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  /* ===========================
     VIEW: EDITOR
  =========================== */
  const renderEditor = () => (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0c0c0c", color: THEME.text, fontFamily: THEME.fontUI, overflow: "hidden" }}>
      
      {/* 1. TOP BAR */}
      <header style={{ 
        height: 64, borderBottom: `1px solid ${THEME.border}`, background: "rgba(9, 9, 11, 0.8)", backdropFilter: "blur(12px)", 
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", zIndex: 50 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setView("dashboard")} style={{ background: "transparent", border: "none", color: THEME.textDim, cursor: "pointer" }}>
            <ArrowLeft size={20} />
          </motion.button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <input 
              value={docTitle} 
              onChange={(e) => setDocTitle(e.target.value)} 
              style={{ background: "transparent", border: "none", color: "white", fontSize: 16, fontWeight: 600, outline: "none", width: 200 }} 
            />
            <span style={{ fontSize: 11, color: THEME.textDim, display: "flex", alignItems: "center", gap: 4 }}>
              {lastSaved === "Saved" ? <CheckCircle size={10} color={THEME.accent} /> : <Cloud size={10} />} {lastSaved}
            </span>
          </div>
        </div>

        {/* Toolbar (Centered) */}
        <div style={{ 
          background: "#1e1e24", borderRadius: 12, padding: "6px 12px", border: `1px solid ${THEME.border}`, 
          display: "flex", alignItems: "center", gap: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" 
        }}>
          <ToolBtn icon={<Undo size={16} />} onClick={() => execCmd("undo")} title="Undo" />
          <ToolBtn icon={<Redo size={16} />} onClick={() => execCmd("redo")} title="Redo" />
          <Divider />
          <ToolBtn icon={<Bold size={16} />} active={activeFormats.bold} onClick={() => execCmd("bold")} title="Bold" />
          <ToolBtn icon={<Italic size={16} />} active={activeFormats.italic} onClick={() => execCmd("italic")} title="Italic" />
          <ToolBtn icon={<Underline size={16} />} active={activeFormats.underline} onClick={() => execCmd("underline")} title="Underline" />
          <Divider />
          <ToolBtn icon={<AlignLeft size={16} />} active={activeFormats.alignLeft} onClick={() => execCmd("justifyLeft")} />
          <ToolBtn icon={<AlignCenter size={16} />} active={activeFormats.alignCenter} onClick={() => execCmd("justifyCenter")} />
          <ToolBtn icon={<List size={16} />} active={activeFormats.ul} onClick={() => execCmd("insertUnorderedList")} />
          <Divider />
          <ToolBtn icon={<ImageIcon size={16} />} onClick={() => alert("Image upload feature coming soon!")} title="Insert Image" />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: "transparent", color: "white", cursor: "pointer" }}
          >
            <SidebarIcon size={18} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }} 
            whileTap={{ scale: 0.95 }}
            onClick={handleExportPDF}
            disabled={isExporting}
            style={{ 
              padding: "8px 16px", borderRadius: 8, background: THEME.accent, color: "white", border: "none", 
              fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 
            }}
          >
            {isExporting ? <span className="loader"></span> : <Download size={16} />} Export
          </motion.button>
        </div>
      </header>

      {/* 2. WORKSPACE */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* Editor Canvas */}
        <div style={{ 
          flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", padding: "40px 20px",
          background: `radial-gradient(circle at 50% 50%, #1a1a1a 0%, #09090b 100%)`, cursor: "default"
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: zoom/100, opacity: 1 }} 
            transition={{ type: "spring", stiffness: 100 }}
            style={{ 
              width: PAGE_SIZES.a4.width, minHeight: PAGE_SIZES.a4.height, 
              background: "white", boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.5)", 
              padding: "25mm", color: "#111", outline: "none", transformOrigin: "top center"
            }}
          >
            <div 
              ref={editorRef} 
              contentEditable 
              suppressContentEditableWarning
              onInput={checkFormats}
              onMouseUp={checkFormats}
              onKeyUp={checkFormats}
              style={{ width: "100%", height: "100%", outline: "none" }}
            >
              {/* Content Injected Here */}
            </div>
          </motion.div>
        </div>

        {/* 3. SETTINGS SIDEBAR (Animated) */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
              style={{ width: 300, background: "#111113", borderLeft: `1px solid ${THEME.border}`, padding: 20, zIndex: 20 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: 1 }}>Settings</h3>
                <button onClick={() => setShowSidebar(false)} style={{ background: "transparent", border: "none", color: THEME.textDim, cursor: "pointer" }}><X size={16} /></button>
              </div>

              {/* Layout Controls */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, color: THEME.textDim, marginBottom: 8 }}>Page Zoom</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1e1e24", padding: 8, borderRadius: 8, border: `1px solid ${THEME.border}` }}>
                  <button onClick={() => setZoom(z => Math.max(50, z-10))} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}><Minus size={14} /></button>
                  <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600 }}>{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(150, z+10))} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}><Plus size={14} /></button>
                </div>
              </div>

              {/* Font Settings */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, color: THEME.textDim, marginBottom: 8 }}>Typography</label>
                <select 
                  onChange={(e) => execCmd("fontName", e.target.value)}
                  style={{ width: "100%", background: "#1e1e24", border: `1px solid ${THEME.border}`, color: "white", padding: 10, borderRadius: 8, outline: "none", cursor: "pointer" }}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Stats */}
              <div style={{ padding: 16, background: "rgba(59, 130, 246, 0.1)", borderRadius: 12, border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px 0", color: THEME.accent, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} /> Document Stats
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: THEME.textDim }}>Words</span>
                  <span style={{ fontWeight: 600 }}>{stats.words}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: THEME.textDim }}>Characters</span>
                  <span style={{ fontWeight: 600 }}>{stats.chars}</span>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ height: 32, background: "#09090b", borderTop: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", fontSize: 11, color: THEME.textDim, zIndex: 50 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <span>Page 1 of 1</span>
          <span>English (US)</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span>Autosave: On</span>
          <span>{Math.ceil(stats.words / 200)} min read time</span>
        </div>
      </div>

    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {view === "dashboard" ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderDashboard()}</motion.div>
      ) : (
        <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderEditor()}</motion.div>
      )}
    </AnimatePresence>
  );
}