import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HrRecruiterSignup from "../pages/HrRecruiterSignup"; // adjust relative path if needed

// no need to import HrRecruiterSignup here for option A

// Demo images/icons (Replace these with your actual assets if needed)
const heroImg = "/dashboard.png";
const feature1Img = "/feature-resume.jpg";
const feature2Img = "/feature-interview.jpg";
const feature3Img = "/feature-mock.jpg";
const iconMail = "/feature-resume.jpg"; // Using placeholder for mail icon
const iconLock = "/feature-interview.jpg"; // Using placeholder for lock icon

/* ──────────────────────────────────────────────
   1. ROLE SELECTION MODAL
   ────────────────────────────────────────────── */
function RoleSelectModal({ open, mode, onSelectRole, onClose }) {
  if (!open) return null;
  const isLogin = mode === "login";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(20,20,21,0.82)",
        backdropFilter: "blur(7px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#050608",
          borderRadius: "1.5rem",
          border: "1px solid #1f2933",
          boxShadow: "0 25px 80px rgba(0,0,0,0.9)",
          width: "100%",
          maxWidth: 520,
          padding: "2.2rem 2.3rem 2rem",
          color: "#ffffff",
          transform: "translateY(0)",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: "0.9rem",
            color: "#15beff",
            fontWeight: 600,
            marginBottom: "0.35rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {isLogin ? "Login" : "Sign up"}
        </div>
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            marginBottom: "0.8rem",
            color: "#fff",
          }}
        >
          Choose your account type
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#b6b6b6",
            marginBottom: "1.8rem",
            lineHeight: "1.5",
          }}
        >
          Select how you want to continue to personalize your experience.
        </p>

        {/* Candidate Option */}
        <button
          onClick={() => onSelectRole("candidate")}
          style={roleButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#15beff")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#242424")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={iconBoxStyle}>
              {/* SVG Icon for Candidate */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.2rem", color: "#fff" }}>
                Candidate
              </div>
              <div style={{ fontSize: "0.9rem", color: "#888" }}>
                {isLogin
                  ? "Analyze resumes & practice interviews"
                  : "Land your dream job with AI coaching"}
              </div>
            </div>
          </div>
          <span style={{ color: "#15beff", fontSize: "1.4rem" }}>→</span>
        </button>

        {/* HR Manager Option */}
        <button
          onClick={() => onSelectRole("hr")}
          style={roleButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#15beff")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#242424")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={iconBoxStyle}>
              {/* SVG Icon for HR */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.2rem", color: "#fff" }}>
                HR Manager
              </div>
              <div style={{ fontSize: "0.9rem", color: "#888" }}>
                {isLogin
                  ? "Manage candidates & track hiring"
                  : "Build better hiring with AI insights"}
              </div>
            </div>
          </div>
          <span style={{ color: "#15beff", fontSize: "1.4rem" }}>→</span>
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: "1.8rem",
            fontSize: "0.95rem",
            color: "#9ca3af",
            background: "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
            padding: "0.5rem",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#fff")}
          onMouseLeave={(e) => (e.target.style.color = "#9ca3af")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const roleButtonStyle = {
  width: "100%",
  background: "#141518",
  borderRadius: "1rem",
  border: "1px solid #242424",
  padding: "1.2rem 1.4rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  marginBottom: "1rem",
  transition: "border-color 0.2s ease, background 0.2s ease",
};

const iconBoxStyle = {
  width: 48,
  height: 48,
  borderRadius: "0.8rem",
  background: "#0b161c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #1f2933",
};

/* ──────────────────────────────────────────────
   2. AUTH FORM MODAL (Login / Signup / OTP / Reset)
   ────────────────────────────────────────────── */
function AuthFormModal({ open, type, mode, onClose }) {
  const navigate = useNavigate();
  const [showHrRecruiterSignup, setShowHrRecruiterSignup] = useState(false);

  
  // State to capture input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [otp, setOtp] = useState("");
  
  // Flow control states: 'form' | 'otp' | 'forgot-email' | 'forgot-otp-reset'
  const [step, setStep] = useState("form"); 
  const [loading, setLoading] = useState(false);

  // --- OTP Timer Logic ---
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  {showHrRecruiterSignup && (
  <div>
    <HrRecruiterSignup />
    {/* The HrRecruiterSignup component itself handles its UI and redirect. 
        If you want to allow closing it and returning to the main page, 
        add a prop like onClose to HrRecruiterSignup that calls setShowHrRecruiterSignup(false). */}
  </div>
)}


  // Reset state whenever the modal opens
  useEffect(() => {
    if (open) {
      setStep("form");
      setEmail("");
      setPassword("");
      setConfirmPass("");
      setOtp("");
      setLoading(false);
      setTimer(60);
      setCanResend(false);
    }
  }, [open, mode]);

  // Countdown Effect
  useEffect(() => {
    let interval;
    if ((step === "otp" || step === "forgot-otp-reset") && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!open || !type || !mode) return null;

  // Dynamic Title Logic
  let title = "Welcome";
  let subtitle = "Please enter your details.";
  
  if (step === "otp") {
    title = "Verify Email";
    subtitle = `Enter the 6-digit code sent to ${email}`;
  } else if (step === "forgot-email") {
    title = "Reset Password";
    subtitle = "Enter your email to receive a reset code.";
  } else if (step === "forgot-otp-reset") {
    title = "Set New Password";
    subtitle = "Enter the code and your new password.";
  } else if (mode === "signup") {
    title = `Sign up as ${type === "candidate" ? "Candidate" : "HR Manager"}`;
    subtitle = "Create an account to get started.";
  } else {
    title = `Login as ${type === "candidate" ? "Candidate" : "HR Manager"}`;
    subtitle = "Welcome back! Please enter your details.";
  }

  // --- 1. Send OTP (Used for both Signup and Forgot Password) ---
  const handleSendOtp = async (isReset = false) => {
    // Prevent double-clicking while request is in progress
    if (loading) return; 

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        // If it's a password reset, go to reset flow, otherwise go to signup OTP flow
        setStep(isReset ? "forgot-otp-reset" : "otp");
        
        // Reset Timer on success
        setTimer(60);
        setCanResend(false);
        
        alert(`Verification code sent to ${email}`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Failed to send code. Please check the email address.");
      }
    } catch (error) {
      console.error("OTP Error:", error);
      alert(error.message || "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Verify Signup & Create Account (Permanent) ---
  const handleVerifySignup = async () => {
    const role = type === "candidate" ? "candidate" : "hr";
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp, role }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // Save user permanently
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);
        localStorage.setItem("authToken", data.access_token);
        if (data.username) localStorage.setItem("username", data.username);
        if (data.phone) localStorage.setItem("phone", data.phone || "");

        alert("Account created successfully!");
        navigate("/dashboard", { 
          state: { 
            userEmail: email, 
            userRole: role, 
            username: data.username,
            phone: data.phone || ""
          } 
        });
      } else {
        alert(data.detail || "Invalid OTP or Email already taken");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Verification failed.");
    }
    setLoading(false);
  };

  // --- 3. Handle Password Reset (OTP + New Password) ---
  const handleResetPassword = async () => {
    if (password !== confirmPass) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Password updated successfully! Please login.");
        setStep("form");
        onClose(); 
      } else {
        alert(data.detail || "Failed to reset password");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Error resetting password.");
    }
    setLoading(false);
  };

  // --- 4. Normal Login (Permanent) ---
  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_identifier: email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("authToken", data.access_token);
        if (data.username) localStorage.setItem("username", data.username);
        if (data.phone) localStorage.setItem("phone", data.phone || "");

        navigate("/dashboard", { 
          state: { 
            userEmail: data.email, 
            userRole: data.role,
            username: data.username,
            phone: data.phone || ""
          } 
        });
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Login error. Please check your connection.");
    }
    setLoading(false);
  };

  // --- Master Submit Handler ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === "otp") {
      handleVerifySignup();
    } else if (step === "forgot-email") {
      handleSendOtp(true); // isReset = true
    } else if (step === "forgot-otp-reset") {
      handleResetPassword();
    } else if (mode === "signup") {
      if (password !== confirmPass) {
        alert("Passwords do not match!");
        return;
      }
      handleSendOtp(false); // isReset = false
    } else {
      handleLogin();
    }
  };

  // --- Resend Handler ---
  const handleResendClick = () => {
    if (!canResend) return;
    const isReset = (step === "forgot-otp-reset");
    handleSendOtp(isReset);
  };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        inset: 0,
        background: "rgba(20,20,21,0.82)",
        backdropFilter: "blur(7px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          minWidth: 350,
          maxWidth: 420,
          background: "#0b0b0c",
          borderRadius: "1.2rem",
          boxShadow: "0 10px 50px #000c",
          padding: "2.5rem 2.2rem",
          width: "93vw",
          margin: "1rem",
          border: "1px solid #1f2933",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: "block",
            color: "#15beff",
            background: "none",
            border: "none",
            marginBottom: "1.5rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.95rem",
            padding: 0,
          }}
        >
          &larr; Back
        </button>
        
        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.8rem", margin: "0 0 0.5rem 0", color: "#fff" }}>
            {title}
          </h2>
          <p style={{ color: "#888", fontSize: "0.95rem", margin: 0, lineHeight: 1.4 }}>
            {subtitle}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          
          {/* FORGOT PASSWORD STEP 1: Enter Email */}
          {step === "forgot-email" && (
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={labelStyle}>Enter your Email</label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {/* OTP STEP (Used for both flows) */}
          {(step === "otp" || step === "forgot-otp-reset") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Enter 6-Digit Code</label>
              <input
                required
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{
                  ...inputStyle,
                  textAlign: "center",
                  letterSpacing: "0.5rem",
                  fontSize: "1.4rem",
                  borderColor: "#15beff",
                }}
              />
              {/* RESEND TIMER */}
              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem", color: "#888" }}>
                {canResend ? (
                  <span 
                    onClick={handleResendClick}
                    style={{ color: "#15beff", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Resend Code
                  </span>
                ) : (
                  <span>Resend code in {timer}s</span>
                )}
              </div>
            </div>
          )}

          {/* RESET PASSWORD STEP 2: New Password */}
          {step === "forgot-otp-reset" && (
            <>
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  required
                  type="password"
                  placeholder="New password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  required
                  type="password"
                  placeholder="Confirm new password"
                  minLength={6}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* STANDARD LOGIN / SIGNUP FORM */}
          {step === "form" && (
            <>
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>Username / Email</label>
                <input
                  required
                  type="text"
                  placeholder="Enter email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>Password</label>
                <input
                  required
                  type="password"
                  placeholder="At least 6 characters"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              {mode === "signup" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    required
                    type="password"
                    placeholder="Confirm password"
                    minLength={6}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#15beff",
              color: "#00203a",
              padding: "0.9rem 0",
              fontWeight: 700,
              fontSize: "1.1rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.2s",
              marginTop: "0.5rem",
            }}
          >
            {loading ? "Processing..." : getButtonText(step, mode)}
          </button>
        </form>

        {/* Links below the button */}
        {mode === "login" && step === "form" && (
          <div style={{ textAlign: "center", marginTop: "1.2rem", color: "#bbb", fontSize: "0.92rem" }}>
            Forgot Password?{" "}
            <span
              style={{ color: "#15beff", textDecoration: "underline", cursor: "pointer", fontWeight: 500 }}
              onClick={() => setStep("forgot-email")}
            >
              Reset Here
            </span>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "1.2rem", color: "#bbb", fontSize: "0.92rem" }}>
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#09eaff", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }}
                onClick={onClose}
              >
                Log in
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                style={{ color: "#09eaff", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }}
                onClick={onClose}
              >
                Sign up
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helpers for Modal
const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: "0.5rem",
  color: "#e5e7eb",
  fontSize: "0.9rem",
};

const inputStyle = {
  width: "100%",
  background: "#141518",
  color: "#fff",
  border: "1px solid #333",
  borderRadius: "8px",
  padding: "0.85rem 1rem",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s",
};

function getButtonText(step, mode) {
  if (step === "forgot-email") return "Send Reset Code";
  if (step === "forgot-otp-reset") return "Reset Password";
  if (step === "otp") return "Verify & Create Account";
  return mode === "signup" ? "Verify Email" : "Login";
}

/* ──────────────────────────────────────────────
   3. MAIN PAGE COMPONENT (EnhancedAuthPage)
   ────────────────────────────────────────────── */
export default function EnhancedAuthPage() {
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();

  // PERMANENT DATA CHECK ON LOAD
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const savedRole = localStorage.getItem("userRole");
    const authToken = localStorage.getItem("authToken");
    const savedUsername = localStorage.getItem("username");
    const savedPhone = localStorage.getItem("phone");
    
    // If logged in, redirect immediately
    if (savedEmail && savedRole && authToken) {
      navigate("/dashboard", { 
        state: { 
          userEmail: savedEmail, 
          userRole: savedRole,
          username: savedUsername,
          phone: savedPhone
        } 
      });
    }
  }, [navigate]);

  const openAuthFlow = (mode) => setModal({ mode });
// Replace your current handleSelectRole with this exact function
const handleSelectRole = (role) => {
  // If there's no active modal flow, ignore clicks
  if (!modal?.mode) return;

  // Debugging log (helps to confirm the click and modal state in dev)
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[EnhancedAuthPage] handleSelectRole ->", { role, modal });
  }

  // If user chose HR during SIGNUP, close the modal and navigate to dedicated HR signup page
  if (role === "hr" && modal.mode === "signup") {
    setModal(null);                 // close the current modal UI
    navigate("/hr/signup");         // navigate to the HR recruiter signup route (Option A)
    return;
  }

  // Default behaviour for other flows (candidate signup, login, etc.)
  setModal({ type: role, mode: modal.mode });
};



  const handleCloseAll = () => setModal(null);

  // <-- FIX: ensure these variable names are used (no stray isChoosingRole2)
  // defensive modal flags (no chance of being callable)
const isChoosingRole = Boolean(modal && !modal.type && modal.mode);
const isAuthFormOpen = Boolean(modal && modal.type && modal.mode);

// debug output to help trace lingering references
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.log("[EnhancedAuthPage] modal:", modal, "isChoosingRole:", isChoosingRole, "isAuthFormOpen:", isAuthFormOpen);
}


  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", fontFamily: "'Inter', 'Montserrat', sans-serif" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.6rem 5vw",
          background: "rgba(22, 23, 27, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #222",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Optional Logo Icon */}
          <span style={{ color: "#15beff", fontWeight: 800, fontSize: "1.8rem", letterSpacing: "-0.03em" }}>
            NextHire
          </span>
        </div>
        <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
          <button
            style={{
              background: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
              padding: "0.6rem 1rem",
              transition: "color 0.2s",
            }}
            onClick={() => openAuthFlow("login")}
          >
            Login
          </button>
          <button
            style={{
              background: "#15beff",
              color: "#050608",
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              padding: "0.6rem 1.4rem",
              boxShadow: "0px 4px 15px rgba(21, 190, 255, 0.3)",
              transition: "transform 0.2s",
            }}
            onClick={() => openAuthFlow("signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "4rem",
          padding: "5rem 5vw 4rem",
          background: "radial-gradient(circle at 50% 0%, #1a1a2c 0%, #111 60%)",
          minHeight: "80vh",
        }}
      >
        <div style={{ flex: "1 1 400px", maxWidth: "600px" }}>
          <div style={{ display: "inline-block", background: "#151519", border: "1px solid #2a2a2a", borderRadius: "100px", padding: "0.4rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ color: "#15beff", fontWeight: 600, fontSize: "0.85rem" }}>New Feature ✨</span>
            <span style={{ color: "#bbb", fontSize: "0.85rem", marginLeft: "0.5rem" }}>Mock Interview Analysis</span>
          </div>
          <h1
            style={{
              fontWeight: 900,
              fontSize: "3.8rem",
              marginBottom: "1.2rem",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}
          >
            Smarter Hiring.<br />
            <span style={{ color: "#15beff", display: "inline-block" }}>Confident Interviews.</span><br />
            AI Powered.
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#bbb",
              marginBottom: "2rem",
              lineHeight: "1.6",
              maxWidth: "90%",
            }}
          >
            Transform your job search with AI-powered resume analysis and
            interview coaching. Get personalized insights and practice until
            perfect.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              style={{
                background: "#15beff",
                color: "#050608",
                fontWeight: 700,
                fontSize: "1.1rem",
                borderRadius: "100px",
                border: "none",
                padding: "0.9rem 2.2rem",
                boxShadow: "0px 4px 20px rgba(21, 190, 255, 0.4)",
                cursor: "pointer",
                transform: "scale(1)",
                transition: "transform 0.2s",
              }}
              onClick={() => openAuthFlow("signup")}
            >
              Get Started Free
            </button>
            <button
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "0.9rem 2.2rem",
                cursor: "pointer",
                backdropFilter: "blur(5px)",
              }}
              onClick={() => openAuthFlow("login")}
            >
              Login
            </button>
          </div>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", color: "#666", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>✓</span> No credit card required
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>✓</span> Free plan available
            </div>
          </div>
        </div>
        <div
          style={{
            flex: "1 1 400px",
            display: "flex",
            justifyContent: "center",
            maxWidth: "600px",
            position: "relative",
          }}
        >
          {/* Decorative Glow */}
          <div style={{ position: "absolute", inset: "10%", background: "#15beff", filter: "blur(120px)", opacity: 0.2, zIndex: 0 }}></div>
          
          <img
            src={heroImg}
            alt="Dashboard preview"
            style={{
              width: "100%",
              filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.6))",
              borderRadius: "1.5rem",
              border: "1px solid #2a2a2a",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </section>

      {/* Powerful Features Section */}
      <section
        style={{
          padding: "5rem 5vw",
          background: "#111",
          borderTop: "1px solid #1f1f1f",
        }}
      >
        <h2
          style={{
            fontWeight: 800,
            fontSize: "2.5rem",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          Powerful Features for Your Success
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "1.2rem",
            marginBottom: "3.5rem",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Everything you need to land your dream job in one platform.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {[
            { img: feature1Img, title: "AI Resume Analysis", desc: "Get instant, comprehensive feedback on your resume with AI-powered insights." },
            { img: feature2Img, title: "Interview Coach", desc: "Practice with our AI coach that provides real-time feedback on your answers." },
            { img: feature3Img, title: "Mock Interviews", desc: "Simulate real interview scenarios and receive detailed performance analytics." },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: "#151519",
                borderRadius: "1.5rem",
                padding: "2.5rem 2rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                border: "1px solid #222",
                transition: "transform 0.2s",
              }}
            >
              <div style={{ width: 50, height: 50, background: "#1a1a2c", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                <img src={feature.img} alt={feature.title} style={{ width: 24, height: 24, opacity: 0.8 }} />
              </div>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  marginBottom: "0.8rem",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "1.05rem",
                  lineHeight: "1.6",
                  marginBottom: 0,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section
        style={{
          padding: "5rem 5vw",
          background: "#0d0d0e",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontWeight: 800,
            fontSize: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          Why Choose NextHire?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            margin: "0 auto",
            color: "#fff",
            fontSize: "1.2rem",
          }}
        >
          {[
            "Improve your resume score by up to 85%",
            "Master interview techniques with AI feedback",
            "Track your progress with detailed analytics",
            "Get hired faster with data-driven insights",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", background: "#151519", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #222" }}>
              <span
                style={{
                  fontSize: "1.5rem",
                  marginRight: "1rem",
                  color: "#15beff",
                  background: "rgba(21, 190, 255, 0.1)",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </span>
              <span style={{ fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Signup/Login cards for Candidate and HR */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "2rem",
          background: "#111",
          padding: "6rem 5vw 8rem",
          borderTop: "1px solid #1f1f1f",
        }}
      >
        {/* Candidate Card */}
        <div
          style={{
            background: "#151519",
            borderRadius: "1.5rem",
            padding: "3rem 2.5rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            textAlign: "center",
            maxWidth: "400px",
            flex: "1 1 300px",
            border: "1px solid #222",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "#15beff" }}></div>
          <div style={{ width: 60, height: 60, background: "#0b161c", borderRadius: "16px", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={iconMail} alt="" style={{ width: 30, height: 30 }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.5rem" }}>Candidate</h2>
          <p style={{ color: "#9ca3af", fontSize: "1.1rem", marginBottom: "2rem" }}>
            Land your dream job with AI coaching and resume analysis.
          </p>
          <button
            style={{
              background: "#15beff",
              color: "#050608",
              fontWeight: 700,
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: "none",
              padding: "1rem 0",
              width: "100%",
              marginBottom: "1rem",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onClick={() => openAuthFlow("signup")}
          >
            Sign up as Candidate
          </button>
          <button
            style={{
              background: "none",
              color: "#fff",
              fontWeight: 600,
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "0.9rem 0",
              width: "100%",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={() => openAuthFlow("login")}
          >
            Login
          </button>
        </div>

        {/* HR Card */}
        <div
          style={{
            background: "#151519",
            borderRadius: "1.5rem",
            padding: "3rem 2.5rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            textAlign: "center",
            maxWidth: "400px",
            flex: "1 1 300px",
            border: "1px solid #222",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "#fff" }}></div>
          <div style={{ width: 60, height: 60, background: "#0b161c", borderRadius: "16px", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={iconLock} alt="" style={{ width: 30, height: 30 }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.5rem" }}>HR Manager</h2>
          <p style={{ color: "#9ca3af", fontSize: "1.1rem", marginBottom: "2rem" }}>
            Build better hiring pipelines with AI-driven candidate insights.
          </p>
          <button
            style={{
              background: "#fff",
              color: "#050608",
              fontWeight: 700,
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: "none",
              padding: "1rem 0",
              width: "100%",
              marginBottom: "1rem",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onClick={() => navigate("/hr/signup")}
          >
            Sign up as HR
          </button>
          <button
            style={{
              background: "none",
              color: "#fff",
              fontWeight: 600,
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "0.9rem 0",
              width: "100%",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={() => openAuthFlow("login")}
          >
            Login
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "3rem 5vw",
          background: "#0b0b0c",
          color: "#666",
          fontSize: "0.95rem",
          borderTop: "1px solid #1f1f1f",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem" }}>NextHire</span>
        </div>
        <p>© 2025 NextHire. All rights reserved.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem" }}>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Contact Support</span>
        </div>
      </footer>

      {/* STYLES FOR ANIMATIONS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

    <RoleSelectModal
  open={isChoosingRole}
  mode={modal?.mode}
  onClose={handleCloseAll}
  onSelectRole={handleSelectRole}
/>

<AuthFormModal
  open={isAuthFormOpen}
  type={modal?.type}
  mode={modal?.mode}
  onClose={handleCloseAll}
/>

    </div>
  );
}
