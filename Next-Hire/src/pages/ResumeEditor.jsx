import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Printer, 
  Undo, Redo, Download, ChevronDown, Type, Highlighter, 
  MoreVertical, Share2, MessageSquare, Sparkles, FileText, ArrowLeft,
  ZoomIn, ZoomOut, Minus, Search, Check, Settings
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- THEME CONFIG ---
const THEME = {
  bg: "#f0f2f5",
  paper: "#ffffff",
  toolbar: "#edf2fa",
  text: "#1f1f1f",
  icon: "#444746",
  accent: "#0b57d0",
  border: "#c7c7c7",
  hover: "rgba(0,0,0,0.06)"
};

const FONTS = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana", "Trebuchet MS", "Roboto", "Open Sans"];
const SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];
const ZOOM_LEVELS = [50, 75, 90, 100, 125, 150, 200];

// --- REUSABLE COMPONENTS ---

const ToolbarButton = ({ icon, label, onClick, active, color, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    title={label}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 30, height: 30, borderRadius: 4,
      border: "none", cursor: disabled ? "default" : "pointer",
      background: active ? "#d3e3fd" : "transparent",
      color: color || (active ? "#0b57d0" : "#444746"),
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.1s"
    }}
    onMouseEnter={e => !disabled && !active && (e.currentTarget.style.background = THEME.hover)}
    onMouseLeave={e => !disabled && !active && (e.currentTarget.style.background = "transparent")}
  >
    {icon}
  </button>
);

const Divider = () => <div style={{ width: 1, height: 18, background: "#d1d5db", margin: "0 6px" }} />;

const Dropdown = ({ value, options, onChange, width = 80 }) => (
  <div style={{ position: "relative", display: "inline-block" }}>
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)}
      style={{
        appearance: "none", background: "transparent", border: "none",
        fontSize: "0.9rem", fontWeight: 500, color: "#444746",
        padding: "4px 8px", borderRadius: 4, cursor: "pointer",
        outline: "none", width: width, textAlign: "left"
      }}
      onMouseEnter={e => e.target.style.background = THEME.hover}
      onMouseLeave={e => e.target.style.background = "transparent"}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

// --- MAIN EDITOR COMPONENT ---

export default function ResumeEditor() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [title, setTitle] = useState("Untitled Resume");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("All changes saved");
  const [zoom, setZoom] = useState(100);
  const [wordCount, setWordCount] = useState(0);

  // Toolbar State
  const [font, setFont] = useState("Arial");
  const [size, setSize] = useState(11);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [align, setAlign] = useState("left"); // left, center, right, justify

  // --- ACTIONS ---

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    checkState();
  };

  const checkState = () => {
    if (!editorRef.current) return;
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));
    setIsStrike(document.queryCommandState("strikeThrough"));
    
    // Word Count
    const text = editorRef.current.innerText || "";
    setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved("Saved to cloud");
    }, 800);
  };

  const handleDownloadPDF = async () => {
    const element = editorRef.current;
    const canvas = await html2canvas(element, { scale: 2.5, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title}.pdf`);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          exec('insertImage', readerEvent.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // --- RENDER ---

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: THEME.bg, fontFamily: "'Roboto', sans-serif", overflow: "hidden" }}>
      
      {/* 1. GOOGLE HEADER */}
      <header style={{ background: "#fff", padding: "0.8rem 1rem", display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid #e0e0e0" }}>
        <button onClick={() => navigate('/dashboard')} title="Back to Dashboard" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#444746" />
        </button>

        <div style={{ width: 32, height: 32, background: "#4285F4", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <FileText size={18} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              onBlur={handleSave}
              style={{ border: "none", fontSize: "1.1rem", fontWeight: 500, color: "#1f1f1f", outline: "none", width: 300 }}
            />
            <span style={{ fontSize: "0.8rem", color: "#5e5e5e" }}>{isSaving ? "Saving..." : lastSaved}</span>
          </div>
          {/* File Menu */}
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.85rem", color: "#444746", marginTop: 2 }}>
            {["File", "Edit", "View", "Insert", "Format", "Tools", "Extensions", "Help"].map(m => (
              <button key={m} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4 }} onMouseEnter={e => e.target.style.background = THEME.hover} onMouseLeave={e => e.target.style.background = "transparent"}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button style={{ border: "none", background: "transparent", cursor: "pointer" }}><MessageSquare size={22} color="#444746" /></button>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#c2e7ff", border: "none", padding: "8px 20px", borderRadius: 24, fontWeight: 600, color: "#001d35", cursor: "pointer", fontSize: "0.9rem" }}>
             <Share2 size={18} /> Share
          </button>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7e22ce", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.9rem" }}>U</div>
        </div>
      </header>

      {/* 2. TOOLBAR */}
      <div style={{ background: THEME.toolbar, padding: "6px 16px", borderRadius: 24, margin: "10px 16px", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <ToolbarButton icon={<Undo size={16} />} onClick={() => exec("undo")} label="Undo (Ctrl+Z)" />
        <ToolbarButton icon={<Redo size={16} />} onClick={() => exec("redo")} label="Redo (Ctrl+Y)" />
        <ToolbarButton icon={<Printer size={16} />} onClick={() => window.print()} label="Print (Ctrl+P)" />
        
        <Divider />
        
        <Dropdown value={zoom + "%"} options={ZOOM_LEVELS.map(z => z + "%")} onChange={(v) => setZoom(parseInt(v))} width={70} />
        
        <Divider />
        
        <Dropdown value={font} options={FONTS} onChange={(v) => { setFont(v); exec("fontName", v); }} width={100} />
        <Divider />
        <Dropdown value={size} options={SIZES} onChange={(v) => { setSize(v); exec("fontSize", 3); }} width={50} />

        <Divider />
        <ToolbarButton icon={<Bold size={16} />} onClick={() => exec("bold")} active={isBold} label="Bold" />
        <ToolbarButton icon={<Italic size={16} />} onClick={() => exec("italic")} active={isItalic} label="Italic" />
        <ToolbarButton icon={<Underline size={16} />} onClick={() => exec("underline")} active={isUnderline} label="Underline" />
        <ToolbarButton icon={<Highlighter size={16} />} onClick={() => exec("backColor", "yellow")} label="Highlight" />
        <ToolbarButton icon={<Type size={16} />} onClick={() => exec("foreColor", "red")} label="Text Color" />

        <Divider />
        <ToolbarButton icon={<LinkIcon size={16} />} onClick={() => { const url = prompt('Enter URL:'); if(url) exec('createLink', url); }} label="Insert Link" />
        <ToolbarButton icon={<ImageIcon size={16} />} onClick={handleImageUpload} label="Insert Image" />
        
        <Divider />
        <ToolbarButton icon={<AlignLeft size={16} />} onClick={() => exec("justifyLeft")} label="Left Align" />
        <ToolbarButton icon={<AlignCenter size={16} />} onClick={() => exec("justifyCenter")} label="Center Align" />
        <ToolbarButton icon={<AlignRight size={16} />} onClick={() => exec("justifyRight")} label="Right Align" />
        <ToolbarButton icon={<AlignJustify size={16} />} onClick={() => exec("justifyFull")} label="Justify" />
        
        <Divider />
        <ToolbarButton icon={<List size={16} />} onClick={() => exec("insertUnorderedList")} label="Bullet List" />
        <ToolbarButton icon={<ListOrdered size={16} />} onClick={() => exec("insertOrderedList")} label="Numbered List" />
        
        <Divider />
        <ToolbarButton icon={<Minus size={16} />} onClick={() => exec("insertHorizontalRule")} label="Horizontal Line" />
        <ToolbarButton icon={<Check size={16} />} onClick={() => alert(`Word Count: ${wordCount}`)} label="Word Count" />
      </div>

      {/* 3. EDITOR CANVAS BACKGROUND */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", padding: "2rem", background: "#e3e5e8" }}>
        
        {/* A4 PAPER */}
        <div 
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyUp={checkState}
          onMouseUp={checkState}
          style={{
            width: "210mm",
            minHeight: "297mm",
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "25.4mm", // 1 inch margins
            color: "#000",
            outline: "none",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease",
            fontFamily: font,
            fontSize: `${size}pt`,
            lineHeight: 1.6
          }}
        >
          <h1 style={{ textAlign: "center", textTransform: "uppercase", borderBottom: "2px solid #000", paddingBottom: 10, fontSize: "24pt", margin: "0 0 20px 0" }}>
            Your Name
          </h1>
          <p style={{ textAlign: "center", fontSize: "10pt", marginBottom: 20, color: "#444" }}>
            your.email@example.com | (555) 123-4567 | linkedin.com/in/yourprofile
          </p>

          <h3 style={{ borderBottom: "1px solid #ccc", textTransform: "uppercase", fontSize: "12pt", fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#222" }}>
            Professional Summary
          </h3>
          <p>Results-oriented professional with experience in...</p>

          <h3 style={{ borderBottom: "1px solid #ccc", textTransform: "uppercase", fontSize: "12pt", fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#222" }}>
            Experience
          </h3>
          <p>
            <strong>Senior Developer</strong>, Tech Corp 
            <span style={{ float: "right" }}>Jan 2023 - Present</span>
          </p>
          <ul>
            <li>Lead a team of 5 developers to build...</li>
            <li>Improved system performance by 40%...</li>
          </ul>

          <h3 style={{ borderBottom: "1px solid #ccc", textTransform: "uppercase", fontSize: "12pt", fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#222" }}>
            Education
          </h3>
          <p>
            <strong>B.S. Computer Science</strong>, University of Technology 
            <span style={{ float: "right" }}>2022</span>
          </p>
        </div>
      </div>

      {/* FLOATING ACTION BUTTONS */}
      <div style={{ position: "fixed", bottom: 30, right: 30, display: "flex", flexDirection: "column", gap: 12 }}>
        <button 
          onClick={() => alert("AI Assistant: Try adding more action verbs like 'Spearheaded' or 'Orchestrated'.")}
          style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", color: "#1a73e8", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          title="AI Suggestions"
        >
          <Sparkles size={24} />
        </button>
        <button 
          onClick={handleDownloadPDF}
          style={{ width: 56, height: 56, borderRadius: "50%", background: "#1a73e8", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          title="Download PDF"
        >
          <Download size={24} />
        </button>
      </div>

    </div>
  );
}
