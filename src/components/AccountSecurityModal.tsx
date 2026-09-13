import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Copy, 
  Check, 
  X, 
  AlertTriangle, 
  LogOut, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Sparkles,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'mfa' | 'password' | 'sessions' | 'email'>('mfa');

  // MFA Setup State
  const [setupStep, setSetupStep] = useState<'idle' | 'password-prompt' | 'scan' | 'verified'>('idle');
  const [currentPassword, setCurrentPassword] = useState('');
  const [mfaSecretData, setMfaSecretData] = useState<{ secret: string; otpauthUrl: string; recoveryCodes: string[] } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [loading, setLoading] = useState(false);

  // Disable MFA State
  const [disablePassword, setDisablePassword] = useState('');
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);

  // Email Verification State
  const [emailOtp, setEmailOtp] = useState('');
  const [emailHint, setEmailHint] = useState<string | null>(null);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !user) return null;

  // MFA Flow handlers
  const handleStartMfaSetup = () => {
    setCurrentPassword('');
    setSetupStep('password-prompt');
  };

  const handleConfirmPasswordForSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return;
    setLoading(true);
    try {
      const res = await api.setupMfa(currentPassword);
      setMfaSecretData(res);
      setSetupStep('scan');
      showToast('TOTP Secret generated. Scan or copy into Authenticator.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Invalid password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfaActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;
    setLoading(true);
    try {
      await api.verifyMfa(verificationCode.trim());
      updateUser({ ...user, mfaEnabled: true });
      setSetupStep('verified');
      showToast('Two-Factor Authentication is now active!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Invalid 6-digit code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) return;
    setLoading(true);
    try {
      await api.disableMfa({ currentPassword: disablePassword });
      updateUser({ ...user, mfaEnabled: false });
      setIsDisablingMfa(false);
      setDisablePassword('');
      setSetupStep('idle');
      showToast('Two-Factor Authentication disabled', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to disable 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Email Verification handlers
  const handleSendEmailVerification = async () => {
    setLoading(true);
    try {
      const res = await api.resendVerification(user.email);
      if (res.verificationCodeHint) {
        setEmailHint(res.verificationCodeHint);
      }
      showToast(res.message || 'Verification code sent to your email', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send verification code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) return;
    setLoading(true);
    try {
      const res = await api.verifyEmail({ email: user.email, code: emailOtp.trim() });
      updateUser(res.user);
      showToast('Email verified successfully!', 'success');
      setEmailOtp('');
      setEmailHint(null);
    } catch (err: any) {
      showToast(err?.message || 'Invalid or expired code', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Revoke all sessions
  const handleRevokeAllSessions = async () => {
    if (!window.confirm('This will invalidate all active sessions across all devices. Continue?')) {
      return;
    }
    setLoading(true);
    try {
      await api.revokeAllSessions();
      showToast('All other sessions revoked. Please log in again.', 'info');
      logout();
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke sessions', 'error');
      setLoading(false);
    }
  };

  // Password Update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters with upper, lower, and special symbols', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.updateProfile({ currentPassword: oldPassword, newPassword });
      showToast('Password updated successfully! All other sessions revoked.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'recovery') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedRecovery(true);
      setTimeout(() => setCopiedRecovery(false), 2000);
    }
    showToast('Copied to clipboard!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Security & Access Protection</h2>
              <p className="text-xs text-neutral-400">Manage 2FA, session revocation, and email verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('mfa')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mfa'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Two-Factor Auth (2FA)</span>
            {user.mfaEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Verification</span>
            {user.isVerified ? (
              <span className="text-[10px] text-emerald-400 font-mono">✓</span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'password'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Active Sessions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* TAB 1: TWO-FACTOR AUTHENTICATION */}
          {activeTab === 'mfa' && (
            <div className="space-y-5">
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${user.mfaEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Status: {user.mfaEnabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Not Active'}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {user.mfaEnabled 
                        ? 'Your account is protected by RFC 6238 TOTP Authenticator code challenge.' 
                        : 'Add an extra layer of security requiring a 6-digit code to log in.'}
                    </p>
                  </div>
                </div>

                {user.mfaEnabled ? (
                  <button
                    onClick={() => setIsDisablingMfa(true)}
                    className="px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/25 transition-colors cursor-pointer"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  setupStep === 'idle' && (
                    <button
                      onClick={handleStartMfaSetup}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      Enable 2FA
                    </button>
                  )
                )}
              </div>

              {/* Disable 2FA Prompt */}
              {isDisablingMfa && (
                <form onSubmit={handleDisableMfa} className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-red-300 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Confirm Disabling Two-Factor Authentication</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Please confirm your current password to turn off 2FA protection on this account.
                  </p>
                  <input
                    type="password"
                    required
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDisablingMfa(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors"
                    >
                      Confirm Disable
                    </button>
                  </div>
                </form>
              )}

              {/* Step 1: Verify Password to Start Setup */}
              {setupStep === 'password-prompt' && (
                <form onSubmit={handleConfirmPasswordForSetup} className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Step 1: Verify Identity to Setup 2FA</span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Please re-enter your current password to generate your TOTP secret key.
                  </p>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSetupStep('idle')}
                      className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Generate Key & Continue
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Display Secret & Recovery Codes */}
              {setupStep === 'scan' && mfaSecretData && (
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Step 2: Setup 2FA Verification (Gmail OTP or Authenticator)</span>
                    </h4>
                    <p className="text-xs text-neutral-400">
                      A 6-digit activation code was sent to your registered Gmail address. You can also optionally add this secret key to Google Authenticator:
                    </p>
                  </div>

                  {/* Secret Key Display */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <span className="font-mono text-xs sm:text-sm font-bold text-amber-400 tracking-wider select-all">
                      {mfaSecretData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(mfaSecretData.secret, 'secret')}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Single-Use Emergency Recovery Codes */}
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Emergency Backup Recovery Codes (Save These)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(mfaSecretData.recoveryCodes.join('\n'), 'recovery')}
                        className="text-[11px] text-amber-400 underline hover:text-amber-300"
                      >
                        {copiedRecovery ? 'Copied all!' : 'Copy all'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {mfaSecretData.recoveryCodes.map((code, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-black/60 font-mono text-[11px] text-neutral-200 text-center select-all">
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      Each code can be used once if you ever lose your phone or authenticator app.
                    </p>
                  </div>

                  {/* Step 3: Enter 6-digit test code */}
                  <form onSubmit={handleVerifyMfaActivation} className="space-y-3 pt-2 border-t border-neutral-800">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                      Step 3: Enter the 6-Digit Code sent to your Gmail (or from Authenticator)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.trim())}
                        placeholder="123456"
                        className="w-48 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-base font-mono tracking-widest text-center text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
                      >
                        Verify & Activate 2FA
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Verified Confirmation */}
              {setupStep === 'verified' && (
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">2FA Protection is Active</h4>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto">
                    You will now be asked for your 6-digit authenticator code each time you sign in to your studio account.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSetupStep('idle')}
                    className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL VERIFICATION */}
          {activeTab === 'email' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${user.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Email: {user.email}</span>
                      {user.isVerified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                          Unverified
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {user.isVerified
                        ? 'Your email is verified for important booking receipts and album proof notifications.'
                        : 'Verify your email to secure your account and receive instant updates.'}
                    </p>
                  </div>
                </div>

                {!user.isVerified && (
                  <button
                    onClick={handleSendEmailVerification}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors"
                  >
                    Send 6-Digit Code
                  </button>
                )}
              </div>

              {/* Code hint helper */}
              {emailHint && (
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Preview Verification Code:</span>
                    <code className="bg-black/50 px-2 py-0.5 rounded font-mono font-bold text-amber-300 tracking-wider">
                      {emailHint}
                    </code>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEmailOtp(emailHint)}
                    className="text-[10px] font-bold text-amber-400 underline"
                  >
                    Use Code
                  </button>
                </div>
              )}

              {!user.isVerified && (
                <form onSubmit={handleVerifyEmail} className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.trim())}
                      placeholder="e.g. 123456"
                      className="w-48 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-base font-mono tracking-widest text-center text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Confirm Verification
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  New Strong Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase, lowercase, special"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-white">Current Active Session</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 font-mono">
                    Token v{user.tokenVersion || 1}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Signed in from your current browser. All requests are protected by JWT Bearer tokens with strict expiration and instant revocation capability.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-red-300">Global Session Invalidation</h4>
                  <p className="text-[11px] text-neutral-400">
                    If you suspect unauthorized access, you can immediately invalidate all issued tokens.
                  </p>
                </div>
                <button
                  onClick={handleRevokeAllSessions}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Sign Out Everywhere
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Encrypted with SHA-256 / Bcrypt (12 rounds)</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
