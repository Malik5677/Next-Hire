import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const iconMail = "/feature-resume.jpg";
const iconLock = "/feature-interview.jpg";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // If path is exactly /login → login mode, otherwise treat as signup
  const isLogin = location.pathname === "/login";

  const handleCandidateClick = () => {
    if (isLogin) {
      // after candidate login, go to candidate dashboard
      navigate("/dashboard");
    } else {
      // candidate signup page
      navigate("/signup/candidate");
    }
  };

  const handleHrClick = () => {
    if (isLogin) {
      // after HR login, go to HR dashboard (change if needed)
      navigate("/hr/dashboard");
    } else {
      // HR signup page
      navigate("/signup/hr");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        fontFamily:
          "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3.5rem 1.5rem 2.5rem",
      }}
    >
      {/* Heading */}
      <h1
        style={{
          color: "#15beff",
          fontWeight: 800,
          fontSize: "2.4rem",
          marginBottom: "0.4rem",
        }}
      >
        {isLogin ? "Welcome Back" : "Get Started"}
      </h1>
      <p
        style={{
          color: "#bfbfbf",
          fontSize: "1.12rem",
          marginBottom: "2.2rem",
        }}
      >
        {isLogin ? "Select your account type" : "Choose your account type"}
      </p>

      {/* Cards wrapper */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {/* Candidate card */}
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#141518",
            borderRadius: "1.2rem",
            border: "1px solid #242424",
            boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
            padding: "2.3rem 2.4rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "0.9rem",
              background: "#0b161c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.2rem",
            }}
          >
            <img
              src={iconMail}
              alt="Candidate"
              style={{ width: 30, height: 30, borderRadius: "0.5rem" }}
            />
          </div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 600,
              marginBottom: "0.35rem",
            }}
          >
            Candidate
          </h2>
          <p
            style={{
              color: "#b7b7b7",
              fontSize: "1.02rem",
              marginBottom: "1.4rem",
            }}
          >
            {isLogin
              ? "Analyze resumes & practice interviews"
              : "Land your dream job with AI coaching"}
          </p>
          <button
            onClick={handleCandidateClick}
            style={{
              background: "none",
              color: "#15beff",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "1.07rem",
              textDecoration: "none",
            }}
          >
            {isLogin ? "Continue as Candidate →" : "Sign up as Candidate →"}
          </button>
        </div>

        {/* HR Manager card */}
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#141518",
            borderRadius: "1.2rem",
            border: "1px solid #242424",
            boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
            padding: "2.3rem 2.4rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "0.9rem",
              background: "#0b161c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.2rem",
            }}
          >
            <img
              src={iconLock}
              alt="HR Manager"
              style={{ width: 30, height: 30, borderRadius: "0.5rem" }}
            />
          </div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 600,
              marginBottom: "0.35rem",
            }}
          >
            HR Manager
          </h2>
          <p
            style={{
              color: "#b7b7b7",
              fontSize: "1.02rem",
              marginBottom: "1.4rem",
            }}
          >
            {isLogin
              ? "Manage candidates & track hiring"
              : "Build better hiring with AI insights"}
          </p>
          <button
            onClick={handleHrClick}
            style={{
              background: "none",
              color: "#15beff",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "1.07rem",
              textDecoration: "none",
            }}
          >
            {isLogin ? "Continue as HR →" : "Sign up as HR →"}
          </button>
        </div>
      </div>

      {/* Bottom switch link */}
      <div
        style={{
          marginTop: "2.8rem",
          fontSize: "1.02rem",
          color: "#b6b6b6",
        }}
      >
        {isLogin ? (
          <>
            Don’t have an account?{" "}
            <span
              style={{
                color: "#15beff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span
              style={{
                color: "#15beff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </>
        )}
      </div>
    </div>
  );
}
