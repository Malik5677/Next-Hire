// src/pages/ResumeWorkspace.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const bg = "#050609";
const panel = "#0b0f16";
const border = "#1f2937";
const accent = "#15beff";

const TEMPLATE_TYPES = [
  { id: "serif", label: "Resume – Serif" },
  { id: "modern", label: "Resume – Modern" },
  { id: "creative", label: "Resume – Creative" },
];

const loadDocs = () => {
  try {
    return JSON.parse(localStorage.getItem("nh_resume_docs") || "[]");
  } catch {
    return [];
  }
};

const saveDocs = (docs) => {
  localStorage.setItem("nh_resume_docs", JSON.stringify(docs));
};

export default function ResumeWorkspace() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [downloadDoc, setDownloadDoc] = useState(null); // {id,title}

  useEffect(() => {
    setDocs(loadDocs());
  }, []);

  const createDoc = (templateId = "blank") => {
    const id = Date.now().toString();
    const baseTitle =
      templateId === "blank"
        ? "Untitled resume"
        : TEMPLATE_TYPES.find((t) => t.id === templateId)?.label || "Untitled";
    const newDoc = {
      id,
      title: baseTitle,
      template: templateId,
      updatedAt: new Date().toISOString(),
    };
    const updated = [newDoc, ...docs];
    setDocs(updated);
    saveDocs(updated);
    navigate(`/resume-editor/${id}`);
  };

  const openDoc = (id) => {
    navigate(`/resume-editor/${id}`);
  };

  const renameDoc = (doc) => {
    const title = prompt("New name:", doc.title);
    if (!title) return;
    const updated = docs.map((d) =>
      d.id === doc.id ? { ...d, title, updatedAt: new Date().toISOString() } : d
    );
    setDocs(updated);
    saveDocs(updated);
  };

  const deleteDoc = (doc) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    const updated = docs.filter((d) => d.id !== doc.id);
    setDocs(updated);
    saveDocs(updated);
  };

  const openDownloadChooser = (doc) => {
    setDownloadDoc(doc);
  };

  const triggerDownload = (format) => {
    if (!downloadDoc) return;
    navigate(`/resume-editor/${downloadDoc.id}?download=${format}`);
    setDownloadDoc(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: "#fff",
        fontFamily: "'Inter','Montserrat',sans-serif",
        padding: "1.5rem 3rem",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg,#15beff,#38bdf8,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            NH
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              NextHire Docs
            </div>
            <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
              Resume workspace
            </div>
          </div>
        </div>
      </header>

      {/* Start a new document */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.1rem" }}>Start a new resume</h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
          }}
        >
          {/* Blank */}
          <div
            onClick={() => createDoc("blank")}
            style={templateCardStyle}
            title="Create a blank resume"
          >
            <div
              style={{
                flex: 1,
                background: "#111827",
                borderRadius: "0.6rem",
                border: `2px dashed ${accent}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                color: accent,
              }}
            >
              +
            </div>
            <div style={templateLabelStyle}>Blank resume</div>
          </div>

          {TEMPLATE_TYPES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => createDoc(tpl.id)}
              style={templateCardStyle}
            >
              <div
                style={{
                  flex: 1,
                  borderRadius: "0.6rem",
                  background:
                    tpl.id === "serif"
                      ? "linear-gradient(180deg,#f9fafb,#e5e7eb)"
                      : tpl.id === "modern"
                      ? "linear-gradient(180deg,#ecfeff,#dbeafe)"
                      : "linear-gradient(180deg,#fef2f2,#fce7f3)",
                }}
              >
                <div
                  style={{
                    width: "70%",
                    height: "14px",
                    margin: "12px auto 4px",
                    background: "#11182733",
                    borderRadius: 99,
                  }}
                />
                <div
                  style={{
                    width: "55%",
                    height: "6px",
                    margin: "0 auto 2px",
                    background: "#11182722",
                    borderRadius: 99,
                  }}
                />
                <div
                  style={{
                    width: "50%",
                    height: "6px",
                    margin: "0 auto 2px",
                    background: "#11182722",
                    borderRadius: 99,
                  }}
                />
              </div>
              <div style={templateLabelStyle}>{tpl.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent documents */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.8rem",
          }}
        >
          <h2 style={{ fontSize: "1.1rem" }}>Recent resumes</h2>
        </div>

        {docs.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            No resumes yet. Start with a blank resume or a template.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: "1rem",
            }}
          >
            {docs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: panel,
                  borderRadius: "0.9rem",
                  padding: "0.9rem",
                  border: `1px solid ${border}`,
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => openDoc(doc.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.4rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      maxWidth: "80%",
                    }}
                  >
                    {doc.title}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === doc.id ? null : doc.id);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
                    ⋮
                  </button>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  Edited{" "}
                  {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                {menuOpenId === doc.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "2.2rem",
                      right: "0.7rem",
                      background: "#020617",
                      borderRadius: "0.6rem",
                      border: `1px solid ${border}`,
                      boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
                      zIndex: 20,
                      width: 190,
                      padding: "0.3rem 0",
                    }}
                  >
                    <MenuItem onClick={() => renameDoc(doc)}>Rename</MenuItem>
                    <MenuItem onClick={() => deleteDoc(doc)}>Remove</MenuItem>
                    <MenuItem onClick={() => openDoc(doc.id)}>
                      Open in editor
                    </MenuItem>
                    <MenuItem onClick={() => openDownloadChooser(doc)}>
                      Download…
                    </MenuItem>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Download chooser */}
      {downloadDoc && (
        <div
          onClick={() => setDownloadDoc(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: panel,
              borderRadius: "1rem",
              padding: "1.75rem 2rem",
              border: `1px solid ${border}`,
              width: 340,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
              Download “{downloadDoc.title}”
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
              Choose a format to export your resume.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                marginTop: "1rem",
                marginBottom: "1.2rem",
              }}
            >
              <FormatButton onClick={() => triggerDownload("pdf")}>
                PDF (.pdf)
              </FormatButton>
              <FormatButton onClick={() => triggerDownload("docx")}>
                Word (.docx)
              </FormatButton>
              <FormatButton onClick={() => triggerDownload("txt")}>
                Plain text (.txt)
              </FormatButton>
            </div>
            <button
              onClick={() => setDownloadDoc(null)}
              style={{ ...secondaryBtn, width: "100%", marginTop: "0.4rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const templateCardStyle = {
  width: 140,
  minWidth: 140,
  height: 170,
  background: "#020617",
  borderRadius: "0.9rem",
  border: "1px solid #1f2937",
  padding: "0.6rem",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
};

const templateLabelStyle = {
  fontSize: "0.85rem",
  marginTop: "0.5rem",
  textAlign: "center",
  color: "#e5e7eb",
};

const MenuItem = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      textAlign: "left",
      padding: "0.45rem 0.9rem",
      background: "transparent",
      border: "none",
      color: "#e5e7eb",
      fontSize: "0.9rem",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const FormatButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "#111827",
      borderRadius: "0.6rem",
      border: "1px solid #374151",
      padding: "0.6rem 0.9rem",
      color: "#e5e7eb",
      fontSize: "0.9rem",
      textAlign: "left",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const secondaryBtn = {
  background: "transparent",
  color: "#e5e7eb",
  borderRadius: "0.6rem",
  border: "1px solid #374151",
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
};
