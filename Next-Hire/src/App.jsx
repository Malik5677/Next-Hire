import React from "react";
import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";

import EnhancedAuthPage from "./pages/EnhancedAuthPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview";
import InterviewCoach from "./pages/InterviewCoach";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeWorkspace from "./pages/ResumeWorkspace";
import ResumeEditor from "./pages/ResumeEditor";
import HrRecruiterSignup from "./pages/HrRecruiterSignup";

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#000" }}>
      <Routes>
        <Route path="/" element={<EnhancedAuthPage />} />
        <Route path="/dashboard" element={<CandidateDashboard />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/interview" element={<MockInterview />} />
        <Route path="/coach" element={<InterviewCoach />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/resume-workspace" element={<ResumeWorkspace />} />
        <Route path="/resume-editor/:id" element={<ResumeEditor />} />
        <Route path="/hr/signup" element={<HrRecruiterSignup />} />
        <Route path="*" element={<h1 style={{ color: "white", textAlign: "center", marginTop: "5rem" }}>404 Page Not Found</h1>} />
      </Routes>
    </Box>
  );
}
