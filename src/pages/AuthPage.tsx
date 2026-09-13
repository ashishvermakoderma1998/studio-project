import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Smartphone,
  ExternalLink,
  MailCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

type AuthViewMode = 'login' | 'signup' | 'verify-register-otp' | 'mfa' | 'forgot-password' | 'reset-password' | 'verify-email';

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess, onNavigate }) => {
  const { 
    login, 
    completeMfaLogin, 
    register, 
    sendRegisterOtp, 
    verifyRegisterOtp, 
    resendRegisterOtp, 
    loginWithDemoAdmin, 
    loginWithDemoUser 
  } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthViewMode>(initialMode === 'signup' ? 'signup' : 'login');
  
  // Primary Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gmail OTP Account Creation State
  const [registerOtp, setRegisterOtp] = useState<string>('');
  const [otpCooldown, setOtpCooldown] = useState<number>(0);

  // 2FA Challenge State
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaEmailMasked, setMfaEmailMasked] = useState<string>('');

  // Password Reset / Verification State
  const [resetCode, setResetCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

  // Cooldown countdown effect
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Password Strength Indicators
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email.trim(), password);
        if (result.mfaRequired && result.mfaChallengeToken) {
          setMfaChallengeToken(result.mfaChallengeToken);
          setMfaCode('');
          setMode('mfa');
          showToast(result.message || 'Two-factor verification code sent to your Gmail', 'info');
          setLoading(false);
          return;
        }
        showToast('Welcome back to Ashish Wedding Film Studio!', 'success');
        onSuccess();
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMessage('Please provide your full name.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMessage('Please provide a valid email address.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please verify.');
          setLoading(false);
          return;
        }
        if (strengthScore < 4) {
          setErrorMessage('Please choose a stronger password matching the security criteria.');
          setLoading(false);
          return;
        }

        // Send 6-digit Gmail OTP to verify before creating account
        await sendRegisterOtp({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password
        });

        setRegisterOtp('');
        setOtpCooldown(60);
        setMode('verify-register-otp');
        showToast(`Verification code sent to your Gmail (${email.trim()}). Please check your inbox.`, 'success');
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check your details.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerOtp.trim() || registerOtp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code sent to your Gmail.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      await verifyRegisterOtp({
        email: email.trim(),
        otp: registerOtp.trim()
      });
      showToast('Gmail verified! Your account is created and active.', 'success');
      onSuccess();
    } catch (err: any) {
      const msg = err?.message || 'Invalid verification code. Please check your Gmail.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    if (otpCooldown > 0 || loading) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await resendRegisterOtp(email.trim());
      setRegisterOtp('');
      setOtpCooldown(60);
      showToast(res.message || `A fresh 6-digit code has been sent to your Gmail (${email.trim()})`, 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend code';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode.trim()) {
      setErrorMessage('Please enter your 6-digit code or 8-character recovery code');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      await completeMfaLogin(mfaChallengeToken, mfaCode.trim());
      showToast('Two-Factor Authentication verified successfully!', 'success');
      onSuccess();
    } catch (err: any) {
      const msg = err?.message || 'Invalid authentication code. Please check and try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.forgotPassword(email.trim());
      setResetCode('');
      showToast(res.message, 'success');
      setMode('reset-password');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim() || !password) {
      setErrorMessage('Please enter the 6-digit reset code and your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (strengthScore < 4) {
      setErrorMessage('Please choose a stronger password matching our security policy.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.resetPassword({
        email: email.trim(),
        code: resetCode.trim(),
        newPassword: password
      });
      showToast(res.message, 'success');
      setPassword('');
      setConfirmPassword('');
      setResetCode('');
      setMode('login');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset password. Code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (role === 'admin') {
        await loginWithDemoAdmin();
        showToast('Logged in as Studio Admin (Ashish Ji)', 'success');
      } else {
        await loginWithDemoUser();
        showToast('Logged in as Client Portal', 'success');
      }
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Demo login failed');
      showToast('Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-neutral-950 shadow-xl shadow-amber-500/20 font-bold mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold font-serif text-white tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'signup' && 'Create Studio Account'}
            {mode === 'verify-register-otp' && 'Verify Your Gmail Address'}
            {mode === 'mfa' && 'Gmail OTP Security Check'}
            {mode === 'forgot-password' && 'Reset Your Password'}
            {mode === 'reset-password' && 'Enter Reset Code'}
          </h1>
          <p className="text-xs text-neutral-400">
            {mode === 'login' && 'Access bookings, Karizma album approvals, and payment receipts'}
            {mode === 'signup' && 'Join Ashish Wedding Film Studio with Gmail OTP verification'}
            {mode === 'verify-register-otp' && `We sent a 6-digit verification code to ${email || 'your Gmail address'}. Enter it to activate your account.`}
            {mode === 'mfa' && 'Enter the 6-digit verification code sent to your Gmail (or your recovery backup code)'}
            {mode === 'forgot-password' && 'We will send a single-use 6-digit reset code valid for 15 minutes'}
            {mode === 'reset-password' && 'Create a new strong password. All previous sessions will be signed out.'}
          </p>
        </div>

        {/* Error / Locked Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Security Notice</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Demo Quick Login Buttons - Only on Sign In */}
        {mode === 'login' && (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/30 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="demo-admin-login-btn"
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Studio Desk</span>
              </button>
              <button
                id="demo-user-login-btn"
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold hover:bg-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span>Client Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-6">

          {/* VIEW: Gmail OTP Account Creation Verification */}
          {mode === 'verify-register-otp' && (
            <form onSubmit={handleVerifyRegisterOtpSubmit} className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <MailCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-300 block">OTP Dispatched to Gmail</span>
                    <span className="text-neutral-400 font-mono text-[11px]">{email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[11px] font-semibold text-amber-400 underline hover:text-amber-300 shrink-0"
                >
                  Edit
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    6-Digit Verification Code
                  </label>
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Gmail</span>
                  </a>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="register-otp-input"
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={registerOtp}
                    onChange={(e) => setRegisterOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-base text-white font-mono tracking-widest focus:outline-none focus:border-amber-500 placeholder:text-neutral-600"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  Please check your Gmail inbox and spam folder for the one-time password.
                </p>
              </div>

              <button
                id="verify-register-otp-btn"
                type="submit"
                disabled={loading || registerOtp.length !== 6}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Create Account</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  disabled={otpCooldown > 0 || loading}
                  onClick={handleResendRegisterOtp}
                  className="text-neutral-400 hover:text-amber-400 disabled:opacity-50 disabled:hover:text-neutral-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend Code to Gmail'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: MFA 2FA Challenge */}
          {mode === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
                <MailCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Enter the 6-digit verification code sent to your Gmail inbox (or an emergency recovery code).</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Verification Code
                  </label>
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Gmail</span>
                  </a>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="mfa-code-input"
                    type="text"
                    required
                    autoFocus
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.trim())}
                    placeholder="e.g. 123456 or rec-xxxx-xxxx"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                id="mfa-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Verify & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMfaCode('');
                  setMfaChallengeToken('');
                }}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Standard Sign In</span>
              </button>
            </form>
          )}

          {/* VIEW: Forgot Password Request */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Send 6-Digit Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </form>
          )}

          {/* VIEW: Reset Password (Confirm with OTP) */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  6-Digit Reset Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="reset-code-input"
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.trim())}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="reset-new-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="reset-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Reset Password & Sign Out All Devices</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Back to Sign In</span>
              </button>
            </form>
          )}

          {/* VIEW: Primary Login or Registration Form */}
          {(mode === 'login' || mode === 'signup') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                    <input
                      id="auth-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Phone Number (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                    <input
                      id="auth-phone-input"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setMode('forgot-password');
                      }}
                      className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist on Registration */}
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                      <input
                        id="auth-confirm-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Visual Strength Meter */}
                  <div className="space-y-2 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Password Policy Requirements:</span>
                      <span className={`font-bold ${strengthScore >= 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {strengthScore >= 4 ? 'Strong' : 'Needs Work'}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`rounded-full transition-colors ${
                            lvl <= strengthScore 
                              ? strengthScore >= 4 ? 'bg-emerald-500' : 'bg-amber-500' 
                              : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-neutral-400 text-[10px] pt-1">
                      <span className={hasMinLength ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                        {hasMinLength ? '✓' : '○'} At least 8 characters
                      </span>
                      <span className={hasUpper ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                        {hasUpper ? '✓' : '○'} Uppercase letter
                      </span>
                      <span className={hasLower ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                        {hasLower ? '✓' : '○'} Lowercase letter
                      </span>
                      <span className={hasNumber ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                        {hasNumber ? '✓' : '○'} Number (0-9)
                      </span>
                      <span className={hasSpecial ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                        {hasSpecial ? '✓' : '○'} Special character
                      </span>
                    </div>
                  </div>
                </>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{mode === 'login' ? 'Sign In to Studio' : 'Create Secure Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle Login/Signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('signup');
                    }}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('login');
                    }}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Security Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-neutral-500 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            Bcrypt Hashing (12 Rounds)
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            Brute-Force Lockout
          </span>
          <span className="flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            RFC 6238 TOTP 2FA
          </span>
        </div>

      </div>
    </div>
  );
};
