import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Chip,
  Badge,
  Paper
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  School as SchoolIcon,
  Videocam as VideocamIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  LinkedIn as LinkedInIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  KeyboardArrowRight as ArrowRightIcon
} from "@mui/icons-material";

import { 
  motion, 
  AnimatePresence 
} from "framer-motion";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';

const ASSETS = {
    logo: "/logo.png",
    defaultAvatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
};

const PALETTE = {
    primary: "#15beff",
    primaryGlow: "rgba(21, 190, 255, 0.4)",
    secondary: "#9333ea",
    secondaryGlow: "rgba(147, 51, 234, 0.4)",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    background: "#050609",
    surface: "#0b0f16",
    surfaceHighlight: "rgba(255, 255, 255, 0.03)",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
    border: "rgba(255, 255, 255, 0.08)"
};

// Heavy Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
        scale: 1, 
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const bounceIn = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
        scale: 1, 
        opacity: 1,
        transition: { type: "spring", stiffness: 150, damping: 12 }
    }
};

const pulse = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } }
};

const GlassCard = ({ children, sx, hoverEffect = true, onClick, noPadding = false }) => (
    <motion.div
        whileHover={hoverEffect ? { y: -8, boxShadow: `0 20px 40px -10px ${PALETTE.primaryGlow}` } : {}}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        style={{
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid ${PALETTE.border}`,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            borderRadius: "24px",
            padding: noPadding ? 0 : "2rem",
            color: "white",
            height: "100%",
            cursor: onClick ? "pointer" : "default",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            ...sx
        }}
    >
        <Box sx={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
            background: "radial-gradient(circle at top right, rgba(21, 190, 255, 0.03), transparent 40%)",
            pointerEvents: "none"
        }} />
        {children}
    </motion.div>
);

const NeoButton = ({ children, variant = "primary", onClick, disabled, fullWidth, icon, sx }) => {
    const bg = variant === "primary" ? PALETTE.primary : variant === "success" ? PALETTE.success : PALETTE.error;
    const glow = variant === "primary" ? PALETTE.primaryGlow : variant === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)";
    
    return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
                fullWidth={fullWidth}
                onClick={onClick}
                disabled={disabled}
                startIcon={icon}
                sx={{
                    bgcolor: disabled ? "rgba(255,255,255,0.1)" : bg,
                    color: disabled ? "rgba(255,255,255,0.3)" : "#000",
                    fontWeight: 700,
                    py: 1.5,
                    px: 3,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontSize: "0.95rem",
                    boxShadow: disabled ? "none" : `0 0 15px ${glow}`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                        bgcolor: disabled ? "rgba(255,255,255,0.1)" : bg,
                        filter: "brightness(1.15)",
                        boxShadow: disabled ? "none" : `0 0 30px ${glow}, 0 0 10px ${bg}`,
                        transform: "translateY(-2px)"
                    },
                    "&:active": { transform: "scale(0.98)" },
                    ...sx
                }}
            >
                {disabled ? <CircularProgress size={24} color="inherit" /> : children}
            </Button>
        </motion.div>
    );
};

const CustomTextField = (props) => (
    <TextField
        {...props}
        variant="outlined"
        sx={{
            "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: "16px",
                transition: "all 0.3s",
                fontFamily: "'Inter', sans-serif",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)", borderWidth: "1px" },
                "&:hover fieldset": { borderColor: PALETTE.primary, boxShadow: `0 0 8px ${PALETTE.primaryGlow}` },
                "&.Mui-focused fieldset": { borderColor: PALETTE.primary, borderWidth: "1px", boxShadow: `0 0 15px ${PALETTE.primaryGlow}` },
            },
            "& .MuiInputLabel-root": { color: PALETTE.textSecondary, fontFamily: "'Inter', sans-serif" },
            "& .MuiInputLabel-root.Mui-focused": { color: PALETTE.primary },
            "& .MuiInputBase-input": { padding: "16px", fontSize: "1rem" },
            ...props.sx
        }}
    />
);

const AnimatedCounter = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
        if (value === undefined || value === null) return;
        let start = 0;
        const end = value;
        const duration = 1500;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = end / steps;
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [value]);
    
    return <span>{displayValue}</span>;
};

const NavButton = ({ icon, text, active, onClick, compact }) => (
    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
        <Button
            fullWidth
            onClick={onClick}
            sx={{
                justifyContent: compact ? "center" : "flex-start",
                color: active ? "#fff" : PALETTE.textSecondary,
                bgcolor: active ? "rgba(21, 190, 255, 0.15)" : "transparent",
                minWidth: compact ? "50px" : "auto",
                py: 1.5, px: 2,
                borderRadius: "14px", mb: 1,
                textTransform: "none",
                fontWeight: active ? 700 : 500,
                borderLeft: active ? `4px solid ${PALETTE.primary}` : "4px solid transparent",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "rgba(21, 190, 255, 0.1)", color: "#fff" },
                "& .MuiButton-startIcon": { marginRight: compact ? 0 : 1, color: active ? PALETTE.primary : "inherit" }
            }}
        >
            {icon && <Box component="span" sx={{ display: "flex", mr: compact ? 0 : 1.5 }}>{icon}</Box>}
            {!compact && text}
        </Button>
    </motion.div>
);

const ProfilePicEditor = ({ isOpen, onClose, currentPic, onSave }) => {
    const [preview, setPreview] = useState(currentPic);
    const fileInputRef = useRef(null);

    useEffect(() => { setPreview(currentPic); }, [currentPic, isOpen]);

    if (!isOpen) return null;

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, bgcolor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
            <motion.div variants={scaleIn} initial="hidden" animate="visible" onClick={e => e.stopPropagation()}>
                <GlassCard sx={{ width: 450, textAlign: "center", border: `1px solid ${PALETTE.primary}` }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                         <Typography variant="h6" fontWeight={700}>Update Photo</Typography>
                         <IconButton onClick={onClose} size="small" sx={{ color: "gray" }}><CloseIcon/></IconButton>
                    </Box>
                    <Box sx={{ position: "relative", width: 140, height: 140, mx: "auto", mb: 4 }}>
                        <motion.div variants={bounceIn} initial="hidden" animate="visible">
                            <Avatar src={preview} sx={{ width: "100%", height: "100%", border: `4px solid ${PALETTE.primary}`, boxShadow: `0 0 30px ${PALETTE.primaryGlow}` }} />
                        </motion.div>
                        <IconButton onClick={() => fileInputRef.current.click()} sx={{ position: "absolute", bottom: 0, right: 0, bgcolor: PALETTE.primary, color: "black", "&:hover": { bgcolor: "#fff" } }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFile} />
                    <Typography variant="body2" color="gray" mb={3}>Supported formats: JPG, PNG. Max size: 5MB.</Typography>
                    <Box display="flex" gap={2}>
                        <Button fullWidth onClick={onClose} sx={{ color: "gray" }}>Cancel</Button>
                        <NeoButton fullWidth onClick={() => { onSave(preview); onClose(); }}>Save Changes</NeoButton>
                    </Box>
                </GlassCard>
            </motion.div>
        </Box>
    );
};

const ProfileWizard = ({ isOpen, onClose, onSaveProfile }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        profilePic: "", resumeUploaded: false, skills: "", experience: "", education: "", linkedin: ""
    });

    useEffect(() => {
        if (isOpen) {
            const saved = JSON.parse(localStorage.getItem("profileData") || "{}");
            setFormData(prev => ({ ...prev, ...saved }));
            setStep(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = () => setStep(p => p + 1);
    const handleBack = () => setStep(p => p - 1);
    const handleFinish = () => {
        localStorage.setItem("profileData", JSON.stringify(formData));
        onSaveProfile(formData);
        onClose();
    };

    return (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, bgcolor: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div variants={scaleIn} initial="hidden" animate="visible" style={{ width: "100%", maxWidth: "650px", padding: "1rem" }}>
                <GlassCard>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h5" fontWeight={800}>Profile Setup</Typography>
                            <Typography variant="caption" color={PALETTE.textSecondary}>Step {step} of 5</Typography>
                        </Box>
                        <IconButton onClick={onClose} sx={{ color: "gray" }}><CloseIcon /></IconButton>
                    </Box>
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }}>
                        <LinearProgress variant="determinate" value={(step/5)*100} sx={{ mb: 4, height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: PALETTE.primary } }} />
                    </motion.div>

                    <Box sx={{ minHeight: 320 }}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                    <Typography variant="h6" align="center" mb={3}>Upload your Profile Photo</Typography>
                                    <Box display="flex" justifyContent="center" mb={3}>
                                        <motion.div variants={bounceIn} initial="hidden" animate="visible">
                                            <Avatar src={formData.profilePic} sx={{ width: 140, height: 140, border: `4px solid ${PALETTE.primary}` }} />
                                        </motion.div>
                                    </Box>
                                    <Box display="flex" justifyContent="center">
                                        <Button component="label" variant="outlined" sx={{ color: PALETTE.primary, borderColor: PALETTE.primary }}>
                                            Choose Image
                                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                                const f = e.target.files[0];
                                                if(f){const r=new FileReader(); r.onloadend=()=>setFormData({...formData, profilePic: r.result}); r.readAsDataURL(f);}
                                            }} />
                                        </Button>
                                    </Box>
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                    <Typography variant="h6" align="center" mb={3}>Upload Resume (PDF)</Typography>
                                    <Box sx={{ border: `2px dashed ${formData.resumeUploaded ? PALETTE.success : "gray"}`, borderRadius: "20px", p: 5, textAlign: "center", cursor: "pointer", bgcolor: formData.resumeUploaded ? "rgba(16, 185, 129, 0.05)" : "transparent", transition: "all 0.3s" }} onClick={() => document.getElementById('wiz-resume').click()}>
                                        <motion.div variants={bounceIn} initial="hidden" animate="visible">
                                            {formData.resumeUploaded ? <CheckCircleIcon sx={{ fontSize: 60, color: PALETTE.success }}/> : <CloudUploadIcon sx={{ fontSize: 60, color: "gray" }}/>}
                                        </motion.div>
                                        <Typography mt={2} color="gray">{formData.resumeUploaded ? "Resume Uploaded Successfully" : "Click to Browse Files"}</Typography>
                                        <input id="wiz-resume" type="file" hidden accept=".pdf" onChange={() => setFormData({...formData, resumeUploaded: true})} />
                                    </Box>
                                </motion.div>
                            )}
                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                    <Typography variant="h6" mb={3}>Core Skills</Typography>
                                    <CustomTextField fullWidth label="e.g. React, Node, Python (comma separated)" multiline rows={4} value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} />
                                </motion.div>
                            )}
                            {step === 4 && (
                                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                    <Typography variant="h6" mb={3}>Professional Details</Typography>
                                    <Box display="flex" flexDirection="column" gap={3}>
                                        <CustomTextField fullWidth label="Years of Experience" type="number" value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} />
                                        <CustomTextField fullWidth label="Highest Education" value={formData.education} onChange={e=>setFormData({...formData, education: e.target.value})} />
                                    </Box>
                                </motion.div>
                            )}
                            {step === 5 && (
                                <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                    <Typography variant="h6" mb={3}>Socials</Typography>
                                    <CustomTextField fullWidth label="LinkedIn Profile URL" value={formData.linkedin} onChange={e=>setFormData({...formData, linkedin: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon color="primary"/></InputAdornment> }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button onClick={handleBack} disabled={step===1} sx={{ color: "gray" }}>Back</Button>
                        {step < 5 ? <NeoButton onClick={handleNext}>Next Step <ArrowRightIcon/></NeoButton> : <NeoButton variant="success" onClick={handleFinish}>Complete Setup</NeoButton>}
                    </Box>
                </GlassCard>
            </motion.div>
        </Box>
    );
};

// Settings Modal with Sign Out Button
const SettingsModal = ({ isOpen, onClose, userInfo, onSaveSettings, onLogout }) => {
    const [editData, setEditData] = useState(userInfo);

    useEffect(() => {
        if (isOpen) {
            setEditData(userInfo);
        }
    }, [isOpen, userInfo]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSaveSettings(editData);
        onClose();
    };

    return (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, bgcolor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
            <motion.div variants={scaleIn} initial="hidden" animate="visible" onClick={e => e.stopPropagation()}>
                <GlassCard sx={{ width: 500, border: `1px solid ${PALETTE.primary}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <Typography variant="h5" fontWeight={700}>Account Settings</Typography>
                        <IconButton onClick={onClose} size="small" sx={{ color: "gray" }}><CloseIcon/></IconButton>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={3}>
                        <motion.div variants={slideInLeft} initial="hidden" animate="visible">
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>Display Name</Typography>
                                <CustomTextField
                                    fullWidth
                                    value={editData.displayName}
                                    onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                                    placeholder="Enter your display name"
                                />
                            </Box>
                        </motion.div>

                        <motion.div variants={slideInLeft} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>Email Address</Typography>
                                <CustomTextField
                                    fullWidth
                                    type="email"
                                    value={editData.userEmail}
                                    onChange={(e) => setEditData({...editData, userEmail: e.target.value})}
                                    placeholder="Enter your email"
                                />
                            </Box>
                        </motion.div>

                        <motion.div variants={slideInLeft} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>Phone</Typography>
                                <CustomTextField
                                    fullWidth
                                    value={editData.phone}
                                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                    placeholder="Enter your phone number"
                                />
                            </Box>
                        </motion.div>

                        <Divider sx={{ borderColor: PALETTE.border, my: 2 }} />

                        <motion.div variants={slideInLeft} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                            <Box display="flex" gap={2}>
                                <Button fullWidth onClick={onClose} sx={{ color: "gray" }}>Cancel</Button>
                                <NeoButton fullWidth onClick={handleSave}>Save Changes</NeoButton>
                            </Box>
                        </motion.div>

                        <motion.div variants={slideInLeft} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                            <NeoButton 
                                fullWidth 
                                variant="error" 
                                onClick={onLogout}
                                icon={<LogoutIcon />}
                            >
                                Sign Out
                            </NeoButton>
                        </motion.div>
                    </Box>
                </GlassCard>
            </motion.div>
        </Box>
    );
};

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isPicEditorOpen, setPicEditorOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  const [userInfo, setUserInfo] = useState({
    displayName: "Guest User",
    userEmail: "guest@example.com",
    userRole: "Candidate",
    phone: "",
  });

  // Initialize stats with zero values for new users
  const [stats, setStats] = useState({
    average_score: 0,
    total_interviews: 0,
    readiness_status: "Not Started",
    recent_history: [],
    weak_areas: [],
    strong_areas: [],
    resumeAnalyzerCompleted: false,
    mockInterviewCompleted: false,
    aiCoachCompleted: false
  });

  const [profileData, setProfileData] = useState({
    profilePic: "", resumeUploaded: false, skills: "", experience: "", education: "", linkedin: ""
  });

  // Load user data and check if new user
  useEffect(() => {
    const storedDisplayName = localStorage.getItem("displayName") || location.state?.displayName || "User";
    const storedEmail = localStorage.getItem("userEmail") || location.state?.userEmail || "guest@example.com";
    const storedRole = localStorage.getItem("userRole") || location.state?.userRole || "Candidate";
    const storedPhone = localStorage.getItem("phone") || "";
    const storedProfile = JSON.parse(localStorage.getItem("profileData") || "{}");
    const storedStats = JSON.parse(localStorage.getItem("userStats") || "{}");
    const isNewUser = localStorage.getItem("isNewUser") === null;

    setUserInfo({ 
      displayName: storedDisplayName, 
      userEmail: storedEmail, 
      userRole: storedRole, 
      phone: storedPhone 
    });
    setProfileData(prev => ({ ...prev, ...storedProfile }));

    setTimeout(() => {
        // If new user, initialize with zero stats
        if (isNewUser) {
            const newStats = {
                average_score: 0,
                total_interviews: 0,
                readiness_status: "Not Started",
                recent_history: [],
                weak_areas: [],
                strong_areas: [],
                resumeAnalyzerCompleted: false,
                mockInterviewCompleted: false,
                aiCoachCompleted: false
            };
            setStats(newStats);
            localStorage.setItem("userStats", JSON.stringify(newStats));
            localStorage.setItem("isNewUser", "false");
        } else {
            // Load existing stats
            setStats(prev => ({ ...prev, ...storedStats }));
        }
        setLoading(false);
    }, 1500);
  }, [location.state]);

  const calculateProfileScore = () => {
      let score = 20;
      if (profileData.profilePic) score += 15;
      if (profileData.resumeUploaded) score += 25;
      if (profileData.skills && profileData.skills.length > 2) score += 15;
      if (profileData.experience) score += 10;
      if (profileData.education) score += 10;
      if (profileData.linkedin) score += 5;
      return Math.min(score, 100);
  };

  const profileScore = calculateProfileScore();
  const initials = userInfo.displayName ? userInfo.displayName.substring(0, 2).toUpperCase() : "GU";

  // Handle logout
  const handleLogout = () => {
      localStorage.clear();
      navigate("/");
  };

  const handleUpdateProfile = (newData) => {
      const updated = { ...userInfo, ...newData };
      setUserInfo(updated);
      
      localStorage.setItem("displayName", updated.displayName);
      localStorage.setItem("userEmail", updated.userEmail);
      localStorage.setItem("userRole", updated.userRole);
      localStorage.setItem("phone", updated.phone);
      
      setSettingsOpen(false);
      setNotificationMessage("Profile updated successfully!");
      setNotificationType("success");
      setNotificationOpen(true);
  };

  const handleSaveProfileData = (newProfileData) => {
      setProfileData(newProfileData);
      localStorage.setItem("profileData", JSON.stringify(newProfileData));
  };

  const handleProfilePicSave = (pic) => {
      const updated = { ...profileData, profilePic: pic };
      setProfileData(updated);
      localStorage.setItem("profileData", JSON.stringify(updated));
      setPicEditorOpen(false);
      setNotificationMessage("Profile picture updated!");
      setNotificationType("success");
      setNotificationOpen(true);
  };

  // Complete task and update stats
  const completeTask = (taskName) => {
    let newStats = { ...stats };
    let scoreIncrease = 0;
    let interviewIncrease = 0;

    if (taskName === "resume-analyzer" && !stats.resumeAnalyzerCompleted) {
        newStats.resumeAnalyzerCompleted = true;
        scoreIncrease = 15;
        interviewIncrease = 1;
    } else if (taskName === "mock-interview" && !stats.mockInterviewCompleted) {
        newStats.mockInterviewCompleted = true;
        scoreIncrease = 25;
        interviewIncrease = 2;
    } else if (taskName === "ai-coach" && !stats.aiCoachCompleted) {
        newStats.aiCoachCompleted = true;
        scoreIncrease = 20;
        interviewIncrease = 1;
    }

    if (scoreIncrease > 0) {
        newStats.average_score = Math.min(newStats.average_score + scoreIncrease, 100);
        newStats.total_interviews = newStats.total_interviews + interviewIncrease;
        
        // Add to recent history
        const newHistoryItem = {
            date: new Date().toISOString().split('T')[0],
            topic: taskName === "resume-analyzer" ? "Resume Analysis" : taskName === "mock-interview" ? "Mock Interview" : "AI Coaching",
            score: scoreIncrease + 60
        };
        newStats.recent_history = [newHistoryItem, ...newStats.recent_history].slice(0, 10);

        // Update readiness status
        if (newStats.average_score >= 80) {
            newStats.readiness_status = "Job Ready";
        } else if (newStats.average_score >= 60) {
            newStats.readiness_status = "Good Progress";
        } else if (newStats.average_score > 0) {
            newStats.readiness_status = "In Progress";
        }

        setStats(newStats);
        localStorage.setItem("userStats", JSON.stringify(newStats));
        
        setNotificationMessage(`${taskName === "resume-analyzer" ? "Resume Analyzer" : taskName === "mock-interview" ? "Mock Interview" : "AI Coach"} completed! Score +${scoreIncrease}`);
        setNotificationType("success");
        setNotificationOpen(true);
    }
  };

  const chartData = stats.recent_history.map(h => ({
      name: h.topic,
      score: h.score,
      fullDate: h.date
  }));

  if (loading) {
      return (
          <Box sx={{ height: "100vh", width: "100vw", bgcolor: PALETTE.background, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <motion.img 
                  src={ASSETS.logo} 
                  alt="Loading" 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                  style={{ width: 80, height: 80, marginBottom: 20 }} 
              />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Typography variant="h6" color={PALETTE.primary} sx={{ letterSpacing: 3 }}>INITIALIZING SYSTEM...</Typography>
              </motion.div>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, delay: 0.5 }}>
                  <LinearProgress sx={{ width: 200, mt: 2, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: PALETTE.primary } }} />
              </motion.div>
          </Box>
      );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", background: `radial-gradient(circle at 10% 20%, ${PALETTE.surface} 0%, ${PALETTE.background} 90%)`, color: "white", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
        
        <motion.div initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
            <Paper elevation={0} sx={{ width: 280, height: "100vh", borderRight: `1px solid ${PALETTE.border}`, background: "rgba(11, 15, 22, 0.7)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", p: 3, zIndex: 100, position: "relative" }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={6} pl={1}>
                        <motion.img src={ASSETS.logo} alt="Logo" style={{ width: 42, height: 42 }} whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} />
                        <Box>
                            <Typography variant="h5" fontWeight={900} sx={{ background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NextHire</Typography>
                            <Typography variant="caption" color={PALETTE.textSecondary} letterSpacing={1}>CANDIDATE</Typography>
                        </Box>
                    </Box>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ flex: 1 }}>
                    <Typography variant="caption" color={PALETTE.textSecondary} fontWeight="bold" sx={{ pl: 2, mb: 2, display: "block" }}>MENU</Typography>
                    <NavButton icon={<DashboardIcon />} text="Dashboard" active onClick={() => navigate("/dashboard")} />
                    <NavButton icon={<DescriptionIcon />} text="Resume Analyzer" onClick={() => { completeTask("resume-analyzer"); navigate("/resume"); }} />
                    <NavButton icon={<BuildIcon />} text="Resume Builder" onClick={() => navigate("/resume-builder")} />
                    <NavButton icon={<SchoolIcon />} text="AI Coach" onClick={() => { completeTask("ai-coach"); navigate("/coach"); }} />
                    <NavButton icon={<VideocamIcon />} text="Mock Interview" onClick={() => { completeTask("mock-interview"); navigate("/interview"); }} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <GlassCard sx={{ mb: 3, p: 2 }} noPadding>
                        <Box p={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="caption" color="gray">Profile Status</Typography>
                                <Typography variant="caption" color={profileScore===100?PALETTE.success:PALETTE.primary}>{profileScore}%</Typography>
                            </Box>
                            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1 }}>
                                <LinearProgress variant="determinate" value={profileScore} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: profileScore===100?PALETTE.success:PALETTE.primary } }} />
                            </motion.div>
                        </Box>
                    </GlassCard>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Box onClick={() => setSettingsOpen(true)} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}>
                            <Avatar src={profileData.profilePic} sx={{ bgcolor: PALETTE.primary, color: "black", fontWeight: "bold" }}>{initials}</Avatar>
                            <Box overflow="hidden">
                                <Typography variant="subtitle2" noWrap>{userInfo.displayName}</Typography>
                                <Typography variant="caption" color="gray">{userInfo.userRole}</Typography>
                            </Box>
                            <SettingsIcon sx={{ ml: "auto", color: "gray", fontSize: 20 }} />
                        </Box>
                    </motion.div>
                </motion.div>
            </Paper>
        </motion.div>

        <Box sx={{ flex: 1, p: 4, overflowY: "auto", position: "relative" }}>
            <Box sx={{ position: "absolute", top: -200, right: -100, width: 600, height: 600, background: `radial-gradient(circle, ${PALETTE.primaryGlow} 0%, transparent 70%)`, pointerEvents: "none", opacity: 0.15 }} />
            <Box sx={{ position: "absolute", bottom: -100, left: 100, width: 500, height: 500, background: `radial-gradient(circle, ${PALETTE.secondaryGlow} 0%, transparent 70%)`, pointerEvents: "none", opacity: 0.15 }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
                    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                        <Typography variant="h3" fontWeight={800} sx={{ color: "white" }}>
                            Hello, <span style={{ color: PALETTE.primary }}>{userInfo.displayName}</span>
                        </Typography>
                        <Typography variant="body1" color={PALETTE.textSecondary} sx={{ mt: 0.5 }}>Here is your interview readiness overview for today.</Typography>
                    </motion.div>
                    <Box display="flex" gap={2}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Tooltip title="Notifications">
                                <IconButton sx={{ bgcolor: "rgba(255,255,255,0.05)", color: "white" }}>
                                    <Badge color="error" variant="dot"><NotificationsIcon /></Badge>
                                </IconButton>
                            </Tooltip>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Tooltip title="Edit Profile">
                                <Avatar src={profileData.profilePic} onClick={() => setPicEditorOpen(true)} sx={{ width: 50, height: 50, border: `2px solid ${PALETTE.primary}`, cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "scale(1.05)" } }}>{initials}</Avatar>
                            </Tooltip>
                        </motion.div>
                    </Box>
                </Box>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
                    
                    <motion.div variants={bounceIn} style={{ flex: "1 1 100%", minWidth: 0 }}>
                        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 30%" }, minWidth: 0 }}>
                            <GlassCard sx={{ background: `linear-gradient(135deg, ${PALETTE.surface} 0%, rgba(21, 190, 255, 0.1) 100%)` }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h2" fontWeight={800} sx={{ textShadow: `0 0 20px ${PALETTE.primaryGlow}` }}>
                                            <AnimatedCounter value={stats.average_score} />
                                        </Typography>
                                        <Typography variant="subtitle1" color="gray" fontWeight={600}>Average Score</Typography>
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                            <Chip icon={<TrendingUpIcon sx={{color: PALETTE.success + "!important"}} />} label={stats.average_score > 0 ? `+${Math.floor(stats.average_score / 10)}% Progress` : "Start Learning"} sx={{ mt: 2, bgcolor: "rgba(16, 185, 129, 0.1)", color: PALETTE.success, border: `1px solid ${PALETTE.success}` }} />
                                        </motion.div>
                                    </Box>
                                    <motion.div variants={pulse} initial="initial" animate="animate">
                                        <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "rgba(21, 190, 255, 0.1)", color: PALETTE.primary }}><DescriptionIcon fontSize="large" /></Box>
                                    </motion.div>
                                </Box>
                            </GlassCard>
                        </Box>
                    </motion.div>

                    <motion.div variants={bounceIn} style={{ flex: "1 1 100%", minWidth: 0 }}>
                        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 30%" }, minWidth: 0 }}>
                            <GlassCard sx={{ background: `linear-gradient(135deg, ${PALETTE.surface} 0%, rgba(147, 51, 234, 0.1) 100%)` }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h2" fontWeight={800} sx={{ textShadow: `0 0 20px ${PALETTE.secondaryGlow}` }}>
                                            <AnimatedCounter value={stats.total_interviews} />
                                        </Typography>
                                        <Typography variant="subtitle1" color="gray" fontWeight={600}>Interviews Completed</Typography>
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                            <Typography variant="caption" color={PALETTE.textSecondary} display="block" mt={2}>Status: <span style={{ color: PALETTE.secondary, fontWeight: "bold" }}>{stats.readiness_status}</span></Typography>
                                        </motion.div>
                                    </Box>
                                    <motion.div variants={pulse} initial="initial" animate="animate">
                                        <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "rgba(147, 51, 234, 0.1)", color: PALETTE.secondary }}><VideocamIcon fontSize="large" /></Box>
                                    </motion.div>
                                </Box>
                            </GlassCard>
                        </Box>
                    </motion.div>

                    <motion.div variants={bounceIn} style={{ flex: "1 1 100%", minWidth: 0 }}>
                        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 30%" }, minWidth: 0 }}>
                            <GlassCard onClick={() => setWizardOpen(true)} sx={{ border: profileScore===100 ? `1px solid ${PALETTE.success}` : undefined }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" height="100%">
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>Profile Status</Typography>
                                        <Typography variant="body2" color="gray" sx={{ mb: 2 }}>{profileScore === 100 ? "Optimization Complete!" : "Steps Remaining"}</Typography>
                                        {profileScore < 100 && <NeoButton variant="primary" sx={{ py: 0.5, px: 2, fontSize: "0.8rem" }}>Complete Now</NeoButton>}
                                    </Box>
                                    <Box position="relative" width={90} height={90}>
                                        <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                                            <motion.circle cx="50" cy="50" r="40" stroke={profileScore === 100 ? PALETTE.success : PALETTE.primary} strokeWidth="8" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: profileScore / 100 }} transition={{ duration: 2, ease: "easeOut" }} />
                                        </svg>
                                        <Typography position="absolute" top="50%" left="50%" sx={{ transform: "translate(-50%, -50%)", fontWeight: "bold" }}>{profileScore}%</Typography>
                                    </Box>
                                </Box>
                            </GlassCard>
                        </Box>
                    </motion.div>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    <motion.div variants={slideInLeft} style={{ flex: "1 1 100%", minWidth: 0 }}>
                        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 65%" }, minWidth: 0 }}>
                            <GlassCard sx={{ height: 450 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                    <Typography variant="h6" fontWeight={700}>Performance Analytics</Typography>
                                    <Box display="flex" gap={1}>
                                        <Chip label="Weekly" color="primary" variant="filled" />
                                        <Chip label="Monthly" variant="outlined" sx={{ color: "gray", borderColor: "rgba(255,255,255,0.1)" }} />
                                    </Box>
                                </Box>
                                <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={PALETTE.primary} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={PALETTE.primary} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke={PALETTE.textSecondary} tickLine={false} axisLine={false} />
                                            <YAxis stroke={PALETTE.textSecondary} tickLine={false} axisLine={false} />
                                            <RechartsTooltip contentStyle={{ backgroundColor: PALETTE.surface, borderColor: PALETTE.border, borderRadius: "12px" }} itemStyle={{ color: "#fff" }} />
                                            <Area type="monotone" dataKey="score" stroke={PALETTE.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </GlassCard>
                        </Box>
                    </motion.div>

                    <motion.div variants={slideInRight} style={{ flex: "1 1 100%", minWidth: 0 }}>
                        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 30%" }, minWidth: 0 }}>
                            <GlassCard sx={{ height: 450, overflowY: "auto" }}>
                                <Typography variant="h6" fontWeight={700} mb={3}>Recent Activity</Typography>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {stats.recent_history.length === 0 ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                            <Typography color="gray" align="center" mt={5}>No activity yet. Complete tasks to see progress!</Typography>
                                        </motion.div>
                                    ) : (
                                        stats.recent_history.map((item, idx) => (
                                            <motion.div 
                                                key={idx} 
                                                initial={{ opacity: 0, x: -20 }} 
                                                animate={{ opacity: 1, x: 0 }} 
                                                transition={{ delay: idx * 0.1 }}
                                                whileHover={{ x: 5 }}
                                                style={{ display: "flex", alignItems: "center", gap: 15, padding: "12px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}
                                            >
                                                <Box sx={{ width: 45, height: 45, borderRadius: "10px", bgcolor: item.score > 80 ? "rgba(16, 185, 129, 0.15)" : "rgba(21, 190, 255, 0.15)", color: item.score > 80 ? PALETTE.success : PALETTE.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    {item.score > 80 ? <StarIcon /> : <TimeIcon />}
                                                </Box>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle2" fontWeight={700}>{item.topic}</Typography>
                                                    <Typography variant="caption" color="gray">{item.date}</Typography>
                                                </Box>
                                                <Typography variant="subtitle2" fontWeight={700} color={item.score > 80 ? PALETTE.success : PALETTE.primary}>{item.score}</Typography>
                                            </motion.div>
                                        ))
                                    )}
                                </Box>
                            </GlassCard>
                        </Box>
                    </motion.div>
                </Box>
            </motion.div>
        </Box>

        {/* Modals */}
        <ProfileWizard isOpen={isWizardOpen} onClose={() => setWizardOpen(false)} onSaveProfile={handleSaveProfileData} />
        <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setSettingsOpen(false)} 
            userInfo={userInfo} 
            onSaveSettings={handleUpdateProfile}
            onLogout={handleLogout}
        />
        <ProfilePicEditor isOpen={isPicEditorOpen} onClose={() => setPicEditorOpen(false)} currentPic={profileData.profilePic} onSave={handleProfilePicSave} />

        {/* Notification Snackbar */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: notificationOpen ? 1 : 0, y: notificationOpen ? 0 : 50 }} transition={{ duration: 0.3 }}>
            <Snackbar open={notificationOpen} autoHideDuration={3000} onClose={() => setNotificationOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert onClose={() => setNotificationOpen(false)} severity={notificationType} sx={{ bgcolor: notificationType === "success" ? PALETTE.success : PALETTE.error, color: "white" }}>
                    {notificationMessage}
                </Alert>
            </Snackbar>
        </motion.div>
    </Box>
  );
}