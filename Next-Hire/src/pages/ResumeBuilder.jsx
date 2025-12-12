/**
 * ============================================================================
 * PROJECT: NEXTHIRE / TALENTRADAR - ENTERPRISE RESUME EDITOR
 * VERSION: 3.0.0 (Ultimate Edition)
 * AUTHOR: AI Assistant
 * DESCRIPTION: A full-featured, Google Docs-style rich text editor optimized 
 *              for building resumes. Includes Dashboard, Dark Mode, 
 *              Page Layout controls, and Export functionality.
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  // Formatting Icons
  Bold, Italic, Underline, Strikethrough, Type, Highlighter, 
  Baseline, PaintRoller, RemoveFormatting,
  
  // Alignment & Lists
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Indent, Outdent, CheckSquare,
  
  // Insert Objects
  Image as ImageIcon, Link as LinkIcon, Table, Minus, 
  
  // System / UI
  Undo, Redo, Printer, Search, ZoomIn, ZoomOut, 
  ChevronDown, ChevronRight, X, Check, Plus, 
  Settings, Layout, FileText, ArrowLeft, 
  MoreVertical, Sidebar, Download, Share2, 
  Trash2, Save, Cloud, Clock, Globe, 
  Maximize, Minimize, GripVertical, File
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ============================================================================
// 1. CONFIGURATION & THEME SYSTEM
// ============================================================================

/**
 * Global Theme Configuration
 * Uses a "Dark UI / Light Paper" approach similar to VS Code or Adobe Suites.
 */
const THEME = {
  colors: {
    // Core Backgrounds
    bg: "#121212",          // Main app background (OLED Black)
    header: "#1E1E1E",      // Header bar background
    toolbar: "#252526",     // Toolbar background
    sidebar: "#1E1E1E",     // Settings sidebar
    ruler: "#1E1E1E",       // Ruler background
    
    // Borders & Dividers
    border: "#333333",      
    divider: "#444444",     

    // Typography
    text: "#E0E0E0",        // Main UI text
    textDim: "#A0A0A0",     // Secondary labels
    textPaper: "#111111",   // Text color ON the resume paper
    
    // Interactive Elements
    accent: "#4B9CFF",      // Primary Brand Color (Blue)
    accentHover: "rgba(75, 156, 255, 0.2)", 
    accentActive: "#0056b3",
    
    // Feedback Colors
    success: "#4CAF50",
    warning: "#FFC107",
    danger: "#FF6B6B",
    
    // Components
    paper: "#FFFFFF",
    inputBg: "#2A2A2A",
    hover: "rgba(255, 255, 255, 0.08)"
  },
  spacing: {
    headerHeight: "60px",
    toolbarHeight: "46px",
    rulerHeight: "24px",
    footerHeight: "28px",
    sidebarWidth: "300px"
  },
  shadows: {
    card: "0 4px 6px rgba(0, 0, 0, 0.3)",
    paper: "0 0 50px rgba(0, 0, 0, 0.5)", // Deep shadow for the page
    dropdown: "0 4px 12px rgba(0,0,0,0.5)"
  },
  fonts: {
    ui: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    editor: "Arial, sans-serif"
  }
};

// Available Fonts for the Editor
const FONTS = [
  "Arial", "Helvetica", "Times New Roman", "Courier New", 
  "Georgia", "Verdana", "Trebuchet MS", "Roboto", "Open Sans", "Calibri"
];

// Zoom Presets
const ZOOM_LEVELS = [50, 75, 90, 100, 110, 125, 150, 175, 200];

// Paper Dimensions
const PAGE_SIZES = {
  a4: { width: "210mm", height: "297mm", label: "A4 (210 x 297 mm)" },
  letter: { width: "215.9mm", height: "279.4mm", label: "Letter (8.5 x 11 in)" },
  legal: { width: "215.9mm", height: "355.6mm", label: "Legal (8.5 x 14 in)" }
};

// Text Style Blocks
const TEXT_STYLES = [
  { label: "Normal text", value: "P", fontSize: "11pt", fontWeight: "400" },
  { label: "Title", value: "H1", fontSize: "26pt", fontWeight: "700" },
  { label: "Subtitle", value: "H2", fontSize: "18pt", fontWeight: "400" },
  { label: "Heading 1", value: "H3", fontSize: "14pt", fontWeight: "700" },
  { label: "Heading 2", value: "H4", fontSize: "12pt", fontWeight: "700" },
  { label: "Heading 3", value: "H5", fontSize: "11pt", fontWeight: "700" },
];

// ============================================================================
// 2. UTILITIES & HELPERS
// ============================================================================
// ============================================================================
// 2. TEMPLATE DATA (This was missing!)
// ============================================================================

const TEMPLATES = [
  { 
    id: "blank", 
    name: "Blank Document", 
    category: "Basic",
    description: "Start from a completely clean slate.", 
    previewColor: "#1E1E1E" 
  },
  { 
    id: "swiss", 
    name: "Swiss Modern", 
    category: "Resume",
    description: "Clean, sans-serif design with bold headers.", 
    previewColor: "#f8f9fa" 
  },
  { 
    id: "executive", 
    name: "Executive Serif", 
    category: "Resume",
    description: "Traditional professional layout for senior roles.", 
    previewColor: "#fff" 
  },
  { 
    id: "developer", 
    name: "Tech Developer", 
    category: "Resume",
    description: "Monospace accents optimized for technical skills.", 
    previewColor: "#f0f4ff" 
  },
  { 
    id: "creative", 
    name: "Creative Studio", 
    category: "Portfolio",
    description: "Modern layout for designers and artists.", 
    previewColor: "#fff0f0" 
  }
];

/**
 * Generates the HTML content for specific templates
 */
const generateTemplateHTML = (id) => {
  const commonContact = `
    <div style="text-align: center; margin-bottom: 24px; color: #555; font-size: 10pt; line-height: 1.5;">
      <span>email@example.com</span> • <span>(555) 123-4567</span> • <span>New York, NY</span>
      <br/>
      <a href="#" style="color: #0066cc; text-decoration: none;">linkedin.com/in/johndoe</a> • <a href="#" style="color: #0066cc; text-decoration: none;">github.com/johndoe</a>
    </div>
  `;

  const commonExp = `
    <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 6px; text-transform: uppercase; font-size: 12pt; margin-top: 24px; letter-spacing: 1px; color: #333;">Experience</h3>
    
    <div style="margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font-weight: bold; font-size: 11pt;">Senior Software Engineer</span>
        <span style="font-size: 10pt; font-weight: bold;">2021 - Present</span>
      </div>
      <div style="color: #555; font-style: italic; margin-bottom: 8px; font-size: 10pt;">Tech Solutions Inc. | San Francisco, CA</div>
      <ul style="margin: 0; padding-left: 18px; font-size: 10.5pt; line-height: 1.5;">
        <li>Spearheaded the migration of legacy code to React, improving load times by 40%.</li>
        <li>Mentored 4 junior developers and conducted weekly code reviews.</li>
        <li>Implemented CI/CD pipelines using GitHub Actions and Docker.</li>
      </ul>
    </div>

    <div style="margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font-weight: bold; font-size: 11pt;">Frontend Developer</span>
        <span style="font-size: 10pt; font-weight: bold;">2018 - 2021</span>
      </div>
      <div style="color: #555; font-style: italic; margin-bottom: 8px; font-size: 10pt;">Creative Agency LLC | Austin, TX</div>
      <ul style="margin: 0; padding-left: 18px; font-size: 10.5pt; line-height: 1.5;">
        <li>Developed responsive websites for over 20 Fortune 500 clients.</li>
        <li>Collaborated with UI/UX designers to implement pixel-perfect interfaces.</li>
      </ul>
    </div>
  `;

  const commonSkills = `
    <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 6px; text-transform: uppercase; font-size: 12pt; margin-top: 24px; letter-spacing: 1px; color: #333;">Skills</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; font-size: 10pt;">
      <span><strong>Languages:</strong> JavaScript (ES6+), TypeScript, Python, SQL</span><br/>
      <span><strong>Frameworks:</strong> React, Next.js, Node.js, Express, Django</span><br/>
      <span><strong>Tools:</strong> Git, Docker, AWS, Figma, Jira</span>
    </div>
  `;

  switch(id) {
    case 'swiss':
      return `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h1 style="font-weight: 900; font-size: 36pt; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 8px; line-height: 1;">John Doe</h1>
          <div style="font-size: 14pt; color: #666; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">Full Stack Developer</div>
          ${commonContact}
          ${commonExp}
          ${commonSkills}
        </div>`;
    case 'executive':
      return `
        <div style="font-family: Georgia, serif; color: #111;">
          <h1 style="font-weight: bold; font-size: 32pt; text-align: center; margin-bottom: 8px;">John Doe</h1>
          <hr style="border: 0; border-top: 2px solid #111; margin: 16px 0;" />
          ${commonContact}
          ${commonExp}
          ${commonSkills}
        </div>`;
    case 'developer':
      return `
        <div style="font-family: 'Courier New', monospace; color: #222;">
          <h1 style="font-weight: bold; font-size: 28pt; color: #0056b3; margin-bottom: 8px;">&lt;John_Doe /&gt;</h1>
          <p style="color: #666; font-size: 12pt;">// Senior Full Stack Developer</p>
          <hr style="border: 0; border-top: 1px dashed #999; margin: 20px 0;" />
          ${commonContact}
          ${commonExp}
          ${commonSkills}
        </div>`;
    default: // Blank
      return `<h1 style="font-size: 24pt;">Untitled Document</h1><p>Start typing here...</p>`;
  }
};

// ============================================================================
// 3. REUSABLE UI COMPONENTS
// ============================================================================

const ToolbarButton = ({ icon, label, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    style={{
      minWidth: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      border: "none",
      background: active ? THEME.colors.accentHover : "transparent",
      // IMPORTANT: Icons are forced WHITE for visibility in Dark Mode
      color: "#FFFFFF", 
      cursor: disabled ? "not-allowed" : "pointer",
      padding: "0 6px",
      opacity: disabled ? 0.3 : 1,
      transition: "background 0.1s ease-in-out",
      margin: "0 1px"
    }}
    onMouseEnter={(e) => !active && !disabled && (e.currentTarget.style.background = THEME.colors.hover)}
    onMouseLeave={(e) => !active && !disabled && (e.currentTarget.style.background = "transparent")}
  >
    {icon}
  </button>
);

const Separator = () => (
  <div style={{ width: "1px", height: "20px", background: THEME.colors.divider, margin: "0 6px" }} />
);

const SidebarSection = ({ title, children, isOpen, onToggle }) => (
  <div style={{ borderBottom: `1px solid ${THEME.colors.border}` }}>
    <button 
      onClick={onToggle}
      style={{ 
        width: "100%", 
        padding: "12px 16px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        background: "transparent", 
        border: "none", 
        color: THEME.colors.text, 
        fontWeight: 600, 
        fontSize: "12px", 
        textTransform: "uppercase", 
        cursor: "pointer" 
      }}
    >
      {title}
      <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
    </button>
    {isOpen && <div style={{ padding: "0 16px 16px 16px", animation: "fadeIn 0.2s" }}>{children}</div>}
  </div>
);

const InputGroup = ({ label, children }) => (
  <div style={{ marginBottom: "14px" }}>
    <label style={{ display: "block", fontSize: "11px", color: THEME.colors.textDim, marginBottom: "6px", fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

// ============================================================================
// 4. CUSTOM HOOKS
// ============================================================================

const useHistory = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const push = (state) => {
    const newHistory = history.slice(0, index + 1);
    newHistory.push(state);
    // Limit history stack to 50 steps to save memory
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (index > 0) setIndex(index - 1);
  };

  const redo = () => {
    if (index < history.length - 1) setIndex(index + 1);
  };

  return { 
    state: history[index], 
    push, 
    undo, 
    redo, 
    canUndo: index > 0, 
    canRedo: index < history.length - 1 
  };
};

// ============================================================================
// 5. MAIN EDITOR COMPONENT
// ============================================================================

export default function UltimateResumeEditor() {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  // --- APP STATE ---
  const [view, setView] = useState("dashboard"); // 'dashboard' or 'editor'
  const [docTitle, setDocTitle] = useState("Untitled Resume");
  const [lastSaved, setLastSaved] = useState("Unsaved");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  
  // Sidebar Collapsible Sections
  const [sidebarSections, setSidebarSections] = useState({ 
    layout: true, 
    type: true, 
    stats: true,
    export: false 
  });

  // --- EDITOR CONTENT STATE ---
  const { state: content, push: pushHistory, undo, redo, canUndo, canRedo } = useHistory("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // --- FORMATTING STATE ---
  const [activeFormats, setActiveFormats] = useState({});
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentSize, setCurrentSize] = useState(11);
  const [currentStyle, setCurrentStyle] = useState("P");

  // --- PAGE LAYOUT STATE ---
  const [zoom, setZoom] = useState(100);
  const [pageSize, setPageSize] = useState("a4");
  const [margins, setMargins] = useState({ top: 25, bottom: 25, left: 25, right: 25 });

  // --- LIFECYCLE: Document Stats Updater ---
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
      setCharCount(text.length);
      setLastSaved("Just now"); // Simulate autosave
    }
  }, [content]);

  // --- LIFECYCLE: Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      // Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // --- ACTIONS ---

  const checkFormatState = () => {
    if (!editorRef.current) return;
    
    // Check boolean states
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strike: document.queryCommandState("strikethrough"),
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
      alignJustify: document.queryCommandState("justifyFull"),
      list: document.queryCommandState("insertUnorderedList"),
      listOrdered: document.queryCommandState("insertOrderedList")
    });
    
    // Check value states
    const f = document.queryCommandValue("fontName");
    if (f) setCurrentFont(f.replace(/['"]+/g, ''));
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    checkFormatState();
    // Push new state to history
    if (editorRef.current) {
      pushHistory(editorRef.current.innerHTML);
    }
  };

  const handleLoadTemplate = (t) => {
    const html = generateTemplateHTML(t.id);
    
    // Reset state
    setDocTitle(t.id === 'blank' ? "Untitled Document" : `${t.name} Draft`);
    setView("editor");
    
    // Defer insertion to ensure DOM is ready
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
        pushHistory(html); // Initial state
        checkFormatState();
      }
    }, 100);
  };

  const toggleSidebarSection = (sec) => {
    setSidebarSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // --- RENDERERS ---

  // 1. DASHBOARD RENDERER
  const renderDashboard = () => (
    <div style={{ minHeight: "100vh", background: THEME.colors.bg, color: THEME.colors.text, fontFamily: THEME.fonts.ui }}>
      
      {/* Navbar */}
      <header style={{ height: THEME.spacing.headerHeight, background: THEME.colors.header, borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", alignItems: "center", padding: "0 40px" }}>
        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #4B9CFF, #0056b3)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px", boxShadow: "0 2px 10px rgba(75, 156, 255, 0.3)" }}>
          <FileText color="#fff" size={24} />
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.5px" }}>Resume Builder <span style={{ opacity: 0.5, fontWeight: 400 }}>Workspace</span></h1>
      </header>
      
      {/* Content */}
      <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Start New Document</h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ background: "transparent", border: `1px solid ${THEME.colors.border}`, color: THEME.colors.textDim, padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>Recent Files</button>
          </div>
        </div>
        
        {/* Template Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "28px" }}>
          
          {/* Blank Card */}
          <div onClick={() => handleLoadTemplate({ id: 'blank', name: 'Blank' })} style={{ cursor: "pointer", transition: "transform 0.2s" }}
               onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
               onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ height: "320px", background: "#1E1E1E", border: `1px solid ${THEME.colors.border}`, borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Plus size={32} color="#fff" />
              </div>
              <span style={{ fontWeight: 500, color: "#fff" }}>Blank Document</span>
            </div>
          </div>

          {/* Templates */}
          {TEMPLATES.slice(1).map(t => (
            <div key={t.id} onClick={() => handleLoadTemplate(t)} style={{ cursor: "pointer", transition: "transform 0.2s" }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                 onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
               <div style={{ height: "320px", background: t.previewColor, border: `1px solid ${THEME.colors.border}`, borderRadius: "8px", position: "relative", overflow: "hidden", marginBottom: "12px" }}>
                  {/* CSS Mockup of Resume */}
                  <div style={{ padding: "24px", opacity: 0.8 }}>
                    <div style={{ width: "50%", height: "8px", background: "#444", marginBottom: "12px" }}></div>
                    <div style={{ width: "100%", height: "1px", background: "#ddd", marginBottom: "20px" }}></div>
                    <div style={{ width: "30%", height: "6px", background: "#888", marginBottom: "8px" }}></div>
                    <div style={{ width: "90%", height: "4px", background: "#ccc", marginBottom: "6px" }}></div>
                    <div style={{ width: "85%", height: "4px", background: "#ccc", marginBottom: "6px" }}></div>
                    <div style={{ width: "80%", height: "4px", background: "#ccc", marginBottom: "24px" }}></div>
                    <div style={{ width: "30%", height: "6px", background: "#888", marginBottom: "8px" }}></div>
                    <div style={{ width: "90%", height: "4px", background: "#ccc", marginBottom: "6px" }}></div>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", color: "white" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>{t.category}</div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  // 2. EDITOR RENDERER
  const renderEditor = () => (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: THEME.colors.bg, color: THEME.colors.text, fontFamily: THEME.fonts.ui }}>
      
      {/* HEADER AREA */}
      <header style={{ height: THEME.spacing.headerHeight, background: THEME.colors.header, borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: "none", color: THEME.colors.textDim, cursor: "pointer", padding: "8px", borderRadius: "50%", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#333"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <ArrowLeft size={20} />
          </button>
          <FileText size={26} color={THEME.colors.accent} />
          <div>
            <input 
              value={docTitle} 
              onChange={(e) => setDocTitle(e.target.value)} 
              style={{ background: "transparent", border: "none", color: THEME.colors.text, fontSize: "16px", fontWeight: 600, width: "300px", outline: "none" }} 
            />
            <div style={{ fontSize: "11px", color: THEME.colors.textDim, display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <Cloud size={10} /> Saved to cloud
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
           <button style={{ background: "transparent", border: `1px solid ${THEME.colors.border}`, color: THEME.colors.text, padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
             <Download size={14} /> Export
           </button>
           <button style={{ background: THEME.colors.accent, border: "none", color: "white", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(75, 156, 255, 0.25)" }}>
             <Share2 size={14} /> Share
           </button>
        </div>
      </header>

      {/* MAIN TOOLBAR */}
      <div style={{ height: THEME.spacing.toolbarHeight, background: THEME.colors.toolbar, borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", alignItems: "center", padding: "0 12px", gap: "2px", overflowX: "auto", flexShrink: 0 }}>
         
         {/* History */}
         <ToolbarButton icon={<Undo size={16} />} onClick={undo} disabled={!canUndo} label="Undo (Ctrl+Z)" />
         <ToolbarButton icon={<Redo size={16} />} onClick={redo} disabled={!canRedo} label="Redo (Ctrl+Y)" />
         <ToolbarButton icon={<Printer size={16} />} onClick={() => window.print()} label="Print" />
         <ToolbarButton icon={<PaintRoller size={16} />} onClick={() => execCmd("removeFormat")} label="Clear Formatting" />
         
         <Separator />

         {/* Zoom Control */}
         <div style={{ display: "flex", alignItems: "center", background: "#1a1a1a", borderRadius: "4px", border: `1px solid ${THEME.colors.border}`, padding: "0 4px", height: "28px", margin: "0 4px" }}>
            <button onClick={() => setZoom(z => Math.max(25, z-10))} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}><Minus size={12} /></button>
            <span style={{ fontSize: "12px", color: "white", width: "36px", textAlign: "center", userSelect: "none" }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z+10))} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}><Plus size={12} /></button>
         </div>

         <Separator />

         {/* Text Style */}
         <select 
           value={currentStyle} 
           onChange={(e) => { setCurrentStyle(e.target.value); execCmd("formatBlock", e.target.value); }}
           style={{ background: "transparent", color: "white", border: "none", fontSize: "13px", fontWeight: 500, width: "110px", outline: "none", cursor: "pointer", marginLeft: "4px" }}
         >
           {TEXT_STYLES.map(s => <option key={s.value} value={s.value} style={{ background: "#333" }}>{s.label}</option>)}
         </select>

         <Separator />

         {/* Font Family */}
         <select 
           value={currentFont} 
           onChange={(e) => { setCurrentFont(e.target.value); execCmd("fontName", e.target.value); }}
           style={{ background: "transparent", color: "white", border: "none", fontSize: "13px", width: "100px", outline: "none", cursor: "pointer" }}
         >
           {FONTS.map(f => <option key={f} value={f} style={{ background: "#333" }}>{f}</option>)}
         </select>

         <Separator />

         {/* Font Size */}
         <ToolbarButton icon={<Minus size={12} />} onClick={() => { setCurrentSize(s => s-1); execCmd("fontSize", "2"); }} />
         <div style={{ width: "28px", height: "22px", border: `1px solid ${THEME.colors.border}`, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "white", fontWeight: "600" }}>{currentSize}</div>
         <ToolbarButton icon={<Plus size={12} />} onClick={() => { setCurrentSize(s => s+1); execCmd("fontSize", "4"); }} />

         <Separator />

         {/* Basic Formatting */}
         <ToolbarButton icon={<Bold size={16} />} active={activeFormats.bold} onClick={() => execCmd("bold")} label="Bold (Ctrl+B)" />
         <ToolbarButton icon={<Italic size={16} />} active={activeFormats.italic} onClick={() => execCmd("italic")} label="Italic (Ctrl+I)" />
         <ToolbarButton icon={<Underline size={16} />} active={activeFormats.underline} onClick={() => execCmd("underline")} label="Underline (Ctrl+U)" />
         <ToolbarButton icon={<Strikethrough size={16} />} active={activeFormats.strike} onClick={() => execCmd("strikeThrough")} label="Strikethrough" />
         
         {/* Colors */}
         <ToolbarButton icon={<Baseline size={16} />} onClick={() => execCmd("foreColor", prompt("Text Color Hex:", "#000000"))} label="Text Color" />
         <ToolbarButton icon={<Highlighter size={16} />} onClick={() => execCmd("backColor", "#FFFF00")} label="Highlight" />

         <Separator />

         {/* Alignment */}
         <ToolbarButton icon={<AlignLeft size={16} />} active={activeFormats.alignLeft} onClick={() => execCmd("justifyLeft")} />
         <ToolbarButton icon={<AlignCenter size={16} />} active={activeFormats.alignCenter} onClick={() => execCmd("justifyCenter")} />
         <ToolbarButton icon={<AlignRight size={16} />} active={activeFormats.alignRight} onClick={() => execCmd("justifyRight")} />
         <ToolbarButton icon={<AlignJustify size={16} />} active={activeFormats.alignJustify} onClick={() => execCmd("justifyFull")} />

         <Separator />

         {/* Lists */}
         <ToolbarButton icon={<List size={16} />} active={activeFormats.list} onClick={() => execCmd("insertUnorderedList")} />
         <ToolbarButton icon={<ListOrdered size={16} />} active={activeFormats.listOrdered} onClick={() => execCmd("insertOrderedList")} />
         <ToolbarButton icon={<Indent size={16} />} onClick={() => execCmd("indent")} />
         <ToolbarButton icon={<Outdent size={16} />} onClick={() => execCmd("outdent")} />
         
         <Separator />

         {/* Inserts */}
         <ToolbarButton icon={<LinkIcon size={16} />} onClick={() => { const url=prompt("Enter URL:"); if(url) execCmd("createLink", url); }} />
         <ToolbarButton icon={<ImageIcon size={16} />} onClick={() => alert("Drag and drop an image onto the page to insert it.")} />

         <div style={{ flex: 1 }} />
         
         {/* Toggle Sidebar */}
         <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: showSidebar ? THEME.colors.accent : "transparent", border: "none", borderRadius: "4px", color: showSidebar ? "white" : THEME.colors.textDim, cursor: "pointer", padding: "6px" }}>
            <Sidebar size={18} />
         </button>
      </div>

      {/* VISUAL RULER (Optional) */}
      {showRuler && (
         <div style={{ height: THEME.spacing.rulerHeight, background: THEME.colors.ruler, borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", justifyContent: "center", position: "relative", flexShrink: 0 }}>
             <div style={{ width: PAGE_SIZES[pageSize].width, height: "100%", background: "#252526", position: "relative", overflow: "hidden" }}>
                 {/* Simulated Ticks */}
                 {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ position: "absolute", left: `${i * 5}%`, height: "6px", width: "1px", background: "#555", bottom: 0 }}>
                       <span style={{ position: "absolute", top: "-14px", left: "-4px", fontSize: "9px", color: "#777" }}>{i}</span>
                    </div>
                 ))}
                 {/* Margins Indicators */}
                 <div style={{ position: "absolute", left: 0, width: `${margins.left}mm`, height: "100%", background: "#181818", opacity: 0.5 }}></div>
                 <div style={{ position: "absolute", right: 0, width: `${margins.right}mm`, height: "100%", background: "#181818", opacity: 0.5 }}></div>
             </div>
         </div>
      )}

      {/* WORKSPACE AREA */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* Main Editor Canvas */}
        <div style={{ flex: 1, background: "#0c0c0c", overflowY: "auto", display: "flex", justifyContent: "center", padding: "40px", position: "relative" }}>
           <div 
             ref={editorRef}
             contentEditable
             suppressContentEditableWarning
             onKeyUp={checkFormatState}
             onMouseUp={checkFormatState}
             onInput={() => {
               // Autosave trigger could go here
             }}
             style={{
                width: PAGE_SIZES[pageSize].width,
                minHeight: PAGE_SIZES[pageSize].height,
                background: "#ffffff",
                boxShadow: THEME.shadows.paper,
                paddingTop: `${margins.top}mm`,
                paddingBottom: `${margins.bottom}mm`,
                paddingLeft: `${margins.left}mm`,
                paddingRight: `${margins.right}mm`,
                color: "#111",
                outline: "none",
                fontFamily: currentFont,
                fontSize: `${currentSize}pt`,
                lineHeight: "1.5",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
                cursor: "text"
             }}
           >
             {/* Content Injected Here via innerHTML */}
           </div>
        </div>

        {/* RIGHT SIDEBAR SETTINGS */}
        {showSidebar && (
          <div style={{ width: THEME.spacing.sidebarWidth, background: THEME.colors.sidebar, borderLeft: `1px solid ${THEME.colors.border}`, display: "flex", flexDirection: "column", overflowY: "auto", zIndex: 5 }}>
             
             <div style={{ padding: "16px", borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings size={16} color={THEME.colors.textDim} />
                <span style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: THEME.colors.textDim }}>Document Settings</span>
             </div>

             {/* Layout Section */}
             <SidebarSection title="Page Setup" isOpen={sidebarSections.layout} onToggle={() => toggleSidebarSection('layout')}>
                <InputGroup label="Paper Size">
                  <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} style={{ width: "100%", background: THEME.colors.inputBg, border: `1px solid ${THEME.colors.border}`, color: "white", padding: "8px", borderRadius: "4px", outline: "none" }}>
                     {Object.keys(PAGE_SIZES).map(k => <option key={k} value={k}>{PAGE_SIZES[k].label}</option>)}
                  </select>
                </InputGroup>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                   <InputGroup label="Top (mm)">
                      <input type="number" value={margins.top} onChange={(e) => setMargins({...margins, top: parseInt(e.target.value)})} style={{ width: "100%", background: THEME.colors.inputBg, border: `1px solid ${THEME.colors.border}`, color: "white", padding: "6px", borderRadius: "4px", outline: "none" }} />
                   </InputGroup>
                   <InputGroup label="Bottom (mm)">
                      <input type="number" value={margins.bottom} onChange={(e) => setMargins({...margins, bottom: parseInt(e.target.value)})} style={{ width: "100%", background: THEME.colors.inputBg, border: `1px solid ${THEME.colors.border}`, color: "white", padding: "6px", borderRadius: "4px", outline: "none" }} />
                   </InputGroup>
                   <InputGroup label="Left (mm)">
                      <input type="number" value={margins.left} onChange={(e) => setMargins({...margins, left: parseInt(e.target.value)})} style={{ width: "100%", background: THEME.colors.inputBg, border: `1px solid ${THEME.colors.border}`, color: "white", padding: "6px", borderRadius: "4px", outline: "none" }} />
                   </InputGroup>
                   <InputGroup label="Right (mm)">
                      <input type="number" value={margins.right} onChange={(e) => setMargins({...margins, right: parseInt(e.target.value)})} style={{ width: "100%", background: THEME.colors.inputBg, border: `1px solid ${THEME.colors.border}`, color: "white", padding: "6px", borderRadius: "4px", outline: "none" }} />
                   </InputGroup>
                </div>
             </SidebarSection>

             {/* Typography Section */}
             <SidebarSection title="Typography" isOpen={sidebarSections.type} onToggle={() => toggleSidebarSection('type')}>
                <InputGroup label="Line Spacing">
                   <select style={{ width: "100%", background: THEME.colors.inputBg, border: `1px solid ${THEME.colors.border}`, color: "white", padding: "8px", borderRadius: "4px", outline: "none" }}>
                      <option>Single (1.0)</option>
                      <option>1.15</option>
                      <option>1.5</option>
                      <option>Double (2.0)</option>
                   </select>
                </InputGroup>
                <InputGroup label="Character Spacing">
                   <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input type="range" min="-1" max="5" step="0.1" style={{ flex: 1 }} />
                      <span style={{ fontSize: "11px", color: "#888" }}>0px</span>
                   </div>
                </InputGroup>
             </SidebarSection>

             {/* Stats Section */}
             <SidebarSection title="Statistics" isOpen={sidebarSections.stats} onToggle={() => toggleSidebarSection('stats')}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "#aaa" }}>
                   <span>Words</span>
                   <span style={{ color: "white", fontWeight: "bold" }}>{wordCount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "#aaa" }}>
                   <span>Characters</span>
                   <span style={{ color: "white", fontWeight: "bold" }}>{charCount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#aaa" }}>
                   <span>Reading Time</span>
                   <span style={{ color: "white" }}>~{Math.ceil(wordCount / 200)} min</span>
                </div>
             </SidebarSection>

          </div>
        )}
      </div>

      {/* STATUS FOOTER */}
      <footer style={{ height: THEME.spacing.footerHeight, background: THEME.colors.header, borderTop: `1px solid ${THEME.colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", fontSize: "11px", color: THEME.colors.textDim, flexShrink: 0, zIndex: 10 }}>
         <div style={{ display: "flex", gap: "20px" }}>
            <span>Page 1 of 1</span>
            <span>{wordCount} words</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Globe size={10} /> English (US)</span>
         </div>
         <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={10} /> Last saved: {lastSaved}</span>
            <div style={{ width: "1px", height: "12px", background: "#444" }}></div>
            <span>Zoom: {zoom}%</span>
         </div>
      </footer>

    </div>
  );

  return view === "dashboard" ? renderDashboard() : renderEditor();
}
