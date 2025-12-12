import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail, User, Building2, ArrowRight } from 'lucide-react';

/**
 * HR Recruitor Signup Form Component
 * 
 * Features:
 * - Multi-step verification flow (4 steps)
 * - Company email validation
 * - OTP verification for company email
 * - Personal details collection
 * - OTP verification for personal email
 * - Success screen with redirect
 * 
 * Design: Dark theme with cyan accents matching NextHire brand
 * Colors: Dark navy (#0a0e27), Cyan (#00D4FF), Slate grays
 */

export default function HRRecruitorSignup() {
  const [step, setStep] = useState('company-email');
  const [formData, setFormData] = useState({
    companyEmail: '',
    companyOtp: '',
    personalEmail: '',
    role: '',
    personalOtp: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate company email domain
  const validateCompanyEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ companyEmail: 'Please enter a valid email address' });
      return false;
    }

    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
    const domain = email.split('@')[1];
    if (commonDomains.includes(domain)) {
      setErrors({ companyEmail: 'Please use your company email, not a personal email service' });
      return false;
    }

    setErrors({});
    return true;
  };

  // Validate personal email
  const validatePersonalEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ personalEmail: 'Please enter a valid email address' });
      return false;
    }
    setErrors({});
    return true;
  };

  // Handle company email submission
  const handleCompanyEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateCompanyEmail(formData.companyEmail)) return;

    setLoading(true);
    setTimeout(() => {
      alert('Verification code sent to your company email');
      setStep('company-otp');
      setLoading(false);
    }, 1000);
  };

  // Handle company OTP verification
  const handleCompanyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyOtp.trim()) {
      setErrors({ companyOtp: 'Please enter the verification code' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (formData.companyOtp === '000000') {
        alert('Company email verified successfully');
        setStep('personal-details');
        setErrors({});
      } else {
        setErrors({ companyOtp: 'Invalid verification code. Please try again.' });
      }
      setLoading(false);
    }, 1000);
  };

  // Handle personal details submission
  const handlePersonalDetailsSubmit = async (e) => {
    e.preventDefault();

    if (!validatePersonalEmail(formData.personalEmail)) return;
    if (!formData.role.trim()) {
      setErrors({ role: 'Please select your role' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      alert('Verification code sent to your personal email');
      setStep('personal-otp');
      setErrors({});
      setLoading(false);
    }, 1000);
  };

  // Handle personal OTP verification
  const handlePersonalOtpSubmit = async (e) => {
    e.preventDefault();
    if (!formData.personalOtp.trim()) {
      setErrors({ personalOtp: 'Please enter the verification code' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (formData.personalOtp === '000000') {
        alert('Account created successfully!');
        setStep('success');
        setErrors({});
      } else {
        setErrors({ personalOtp: 'Invalid verification code. Please try again.' });
      }
      setLoading(false);
    }, 1000);
  };

  // Step indicator component
  const StepIndicator = () => (
    <div style={styles.stepContainer}>
      {['company-email', 'company-otp', 'personal-details', 'personal-otp'].map((s, idx) => (
        <React.Fragment key={s}>
          <div
            style={{
              ...styles.stepBadge,
              backgroundColor:
                step === s
                  ? '#00D4FF'
                  : ['company-email', 'company-otp', 'personal-details', 'personal-otp'].indexOf(step) > idx
                  ? '#00D4FF'
                  : '#3d4563',
              color:
                ['company-email', 'company-otp', 'personal-details', 'personal-otp'].indexOf(step) > idx
                  ? '#0a0e27'
                  : step === s
                  ? '#0a0e27'
                  : '#8a92a8',
            }}
          >
            {['company-email', 'company-otp', 'personal-details', 'personal-otp'].indexOf(step) > idx ? (
              <CheckCircle2 size={20} />
            ) : (
              idx + 1
            )}
          </div>
          {idx < 3 && (
            <div
              style={{
                ...styles.stepLine,
                backgroundColor:
                  ['company-email', 'company-otp', 'personal-details', 'personal-otp'].indexOf(step) > idx
                    ? '#00D4FF'
                    : '#3d4563',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.bgGradient1} />
      <div style={styles.bgGradient2} />

      <div style={styles.card}>
        <div style={styles.cardContent}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.logo}>NextHire</h1>
            <p style={styles.subtitle}>HR Recruitor Registration</p>
          </div>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Company Email Step */}
          {step === 'company-email' && (
            <form onSubmit={handleCompanyEmailSubmit} style={styles.form}>
              <div>
                <h2 style={styles.stepTitle}>Verify Company Email</h2>
                <p style={styles.stepDescription}>Enter your company email address to get started</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Building2 size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  Company Email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={formData.companyEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, companyEmail: e.target.value });
                    setErrors({});
                  }}
                  style={styles.input}
                />
                {errors.companyEmail && (
                  <p style={styles.error}>
                    <AlertCircle size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    {errors.companyEmail}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Sending...' : 'Send Verification Code'}
                {!loading && <ArrowRight size={16} style={{ marginLeft: '8px', display: 'inline' }} />}
              </button>
            </form>
          )}

          {/* Company OTP Step */}
          {step === 'company-otp' && (
            <form onSubmit={handleCompanyOtpSubmit} style={styles.form}>
              <div>
                <h2 style={styles.stepTitle}>Verify Company Email</h2>
                <p style={styles.stepDescription}>
                  We sent a verification code to <span style={{ color: '#00D4FF' }}>{formData.companyEmail}</span>
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Mail size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={formData.companyOtp}
                  onChange={(e) => {
                    setFormData({ ...formData, companyOtp: e.target.value.replace(/\D/g, '') });
                    setErrors({});
                  }}
                  style={{ ...styles.input, ...styles.otpInput }}
                />
                {errors.companyOtp && (
                  <p style={styles.error}>
                    <AlertCircle size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    {errors.companyOtp}
                  </p>
                )}
                <p style={styles.hint}>Didn't receive the code? Check your spam folder or request a new one.</p>
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
                {!loading && <ArrowRight size={16} style={{ marginLeft: '8px', display: 'inline' }} />}
              </button>

              <button
                type="button"
                onClick={() => setStep('company-email')}
                style={styles.backButton}
              >
                Back
              </button>
            </form>
          )}

          {/* Personal Details Step */}
          {step === 'personal-details' && (
            <form onSubmit={handlePersonalDetailsSubmit} style={styles.form}>
              <div>
                <h2 style={styles.stepTitle}>Your Details</h2>
                <p style={styles.stepDescription}>Complete your profile information</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Mail size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  Personal Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.personalEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, personalEmail: e.target.value });
                    setErrors({});
                  }}
                  style={styles.input}
                />
                {errors.personalEmail && (
                  <p style={styles.error}>
                    <AlertCircle size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    {errors.personalEmail}
                  </p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <User size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  Your Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value });
                    setErrors({});
                  }}
                  style={styles.select}
                >
                  <option value="">Select your role...</option>
                  <option value="hr-manager">HR Manager</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring-manager">Hiring Manager</option>
                  <option value="talent-acquisition">Talent Acquisition Lead</option>
                  <option value="other">Other</option>
                </select>
                {errors.role && (
                  <p style={styles.error}>
                    <AlertCircle size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    {errors.role}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Sending...' : 'Send Verification Code'}
                {!loading && <ArrowRight size={16} style={{ marginLeft: '8px', display: 'inline' }} />}
              </button>

              <button
                type="button"
                onClick={() => setStep('company-otp')}
                style={styles.backButton}
              >
                Back
              </button>
            </form>
          )}

          {/* Personal OTP Step */}
          {step === 'personal-otp' && (
            <form onSubmit={handlePersonalOtpSubmit} style={styles.form}>
              <div>
                <h2 style={styles.stepTitle}>Verify Personal Email</h2>
                <p style={styles.stepDescription}>
                  We sent a verification code to <span style={{ color: '#00D4FF' }}>{formData.personalEmail}</span>
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Lock size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={formData.personalOtp}
                  onChange={(e) => {
                    setFormData({ ...formData, personalOtp: e.target.value.replace(/\D/g, '') });
                    setErrors({});
                  }}
                  style={{ ...styles.input, ...styles.otpInput }}
                />
                {errors.personalOtp && (
                  <p style={styles.error}>
                    <AlertCircle size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    {errors.personalOtp}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Verifying...' : 'Complete Registration'}
                {!loading && <ArrowRight size={16} style={{ marginLeft: '8px', display: 'inline' }} />}
              </button>

              <button
                type="button"
                onClick={() => setStep('personal-details')}
                style={styles.backButton}
              >
                Back
              </button>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div style={styles.successContainer}>
              <div style={styles.successIcon}>
                <CheckCircle2 size={32} color="#00D4FF" />
              </div>

              <div style={styles.successContent}>
                <h2 style={styles.successTitle}>Welcome to NextHire!</h2>
                <p style={styles.successText}>
                  Your account has been successfully created. You're all set to start recruiting.
                </p>
              </div>

              <div style={styles.successDetails}>
                <p style={styles.detailItem}>
                  <span style={{ color: '#00D4FF', fontWeight: '600' }}>Company Email:</span> {formData.companyEmail}
                </p>
                <p style={styles.detailItem}>
                  <span style={{ color: '#00D4FF', fontWeight: '600' }}>Role:</span> {formData.role}
                </p>
              </div>

              <button
                onClick={() => {
                  window.location.href = '/hr/dashboard';
                }}
                style={styles.button}
              >
                Go to HR Dashboard
                <ArrowRight size={16} style={{ marginLeft: '8px', display: 'inline' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #0f172a, #0a0e27, #1e293b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGradient1: {
    position: 'absolute',
    top: '80px',
    left: '40px',
    width: '288px',
    height: '288px',
    background: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '50%',
    filter: 'blur(96px)',
    opacity: 0.2,
    pointerEvents: 'none',
  },
  bgGradient2: {
    position: 'absolute',
    bottom: '80px',
    right: '40px',
    width: '288px',
    height: '288px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '50%',
    filter: 'blur(96px)',
    opacity: 0.2,
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '448px',
    position: 'relative',
    zIndex: 10,
    background: '#1a1f3a',
    border: '1px solid #2d3554',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  cardContent: {
    padding: '32px',
  },
  header: {
    marginBottom: '32px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#8a92a8',
    margin: 0,
  },
  stepContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  stepBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  stepLine: {
    width: '48px',
    height: '4px',
    marginX: '8px',
    transition: 'all 0.3s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  stepDescription: {
    fontSize: '14px',
    color: '#8a92a8',
    margin: 0,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px 16px',
    background: '#0f172a',
    border: '1px solid #2d3554',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: '24px',
    letterSpacing: '8px',
    fontWeight: '600',
  },
  select: {
    width: '100%',
    padding: '10px 16px',
    background: '#0f172a',
    border: '1px solid #2d3554',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    background: '#00D4FF',
    color: '#0a0e27',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    color: '#8a92a8',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  error: {
    fontSize: '14px',
    color: '#ff4444',
    margin: '8px 0 0 0',
    display: 'flex',
    alignItems: 'center',
  },
  hint: {
    fontSize: '12px',
    color: '#64748b',
    margin: '8px 0 0 0',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    textAlign: 'center',
  },
  successIcon: {
    display: 'flex',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    background: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  successContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  successText: {
    fontSize: '14px',
    color: '#8a92a8',
    margin: 0,
  },
  successDetails: {
    background: 'rgba(45, 53, 84, 0.5)',
    border: '1px solid #2d3554',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
  },
  detailItem: {
    fontSize: '14px',
    color: '#8a92a8',
    margin: '0 0 8px 0',
  },
};