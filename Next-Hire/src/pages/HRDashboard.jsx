import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HRDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/hr/candidates?search=${search}&role=${role}&min_score=${minScore}&status=${status}`
      );
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const gotoProfile = (email) => {
    navigate(`/candidate/${email}`);
  };

  return (
    <>
      {/* INLINE CSS */}
      <style>{`
        body {
          background: #0a0018;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .hr-root {
          padding: 26px;
          color: white;
        }

        .title {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #d400ff, #6a00ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .filters input, .filters select {
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: rgba(255,255,255,0.1);
          color: white;
          outline: none;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
          margin-top: 20px;
        }

        .card {
          padding: 18px;
          border-radius: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(14px);
          cursor: pointer;
          transition: 0.25s;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 0 18px #b400ff90;
        }

        .avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 2px solid #9b00ff;
          margin-bottom: 10px;
        }

        .name {
          font-size: 20px;
          font-weight: 700;
        }

        .role {
          font-size: 13px;
          opacity: 0.7;
          margin-bottom: 8px;
        }

        .score-badge {
          padding: 6px 10px;
          border-radius: 12px;
          font-size: 12px;
          background: linear-gradient(90deg, #9b00ff, #d400ff);
          display: inline-block;
          margin-top: 8px;
          font-weight: bold;
        }

        .status-tag {
          margin-top: 10px;
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 12px;
          display: inline-block;
          background: rgba(255,255,255,0.15);
        }

        .status-hired { background: rgba(0,255,100,0.25); }
        .status-shortlisted { background: rgba(0,150,255,0.25); }
        .status-rejected { background: rgba(255,0,80,0.25); }

      `}</style>

      {/* UI */}
      <div className="hr-root">
        <div className="title">HR Candidate Dashboard</div>

        {/* FILTER BAR */}
        <div className="filters">
          <input placeholder="Search name/email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="software engineer">Software Engineer</option>
            <option value="web developer">Web Developer</option>
            <option value="data analyst">Data Analyst</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Any Status</option>
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="final">Final Round</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={minScore} onChange={(e) => setMinScore(e.target.value)}>
            <option value={0}>Min Score</option>
            <option value={50}>50+</option>
            <option value={70}>70+</option>
            <option value={85}>85+</option>
          </select>

          <button 
            onClick={loadCandidates}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#d400ff",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Apply
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ marginTop: 30, fontSize: 18, opacity: 0.6 }}>
            Loading candidates…
          </div>
        )}

        {/* CANDIDATE GRID */}
        {!loading && (
          <div className="grid">
            {candidates.map((c, i) => (
              <div key={i} className="card" onClick={() => gotoProfile(c.email)}>
                <img src={c.profile_pic} className="avatar" />

                <div className="name">{c.name}</div>
                <div className="role">{c.role}</div>

                <div className="score-badge">
                  Overall Score: {c.overall_score}
                </div>

                <div
                  className={`status-tag status-${c.status}`}
                  style={{ textTransform: "capitalize" }}
                >
                  {c.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
