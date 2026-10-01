import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, ShieldAlert, KeyRound, LogOut, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface AdminSessionLockOverlayProps {
  adminEmail: string;
  inactiveSeconds?: number;
  onUnlock: () => void;
  onLogout: () => void;
}

export const AdminSessionLockOverlay: React.FC<AdminSessionLockOverlayProps> = ({
  adminEmail,
  inactiveSeconds = 300,
  onUnlock,
  onLogout
}) => {
  const [unlockMethod, setUnlockMethod] = useState<'google' | 'otp'>('google');
  const [otpValue, setOtpValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [elapsedInactive, setElapsedInactive] = useState(inactiveSeconds);

  // Live timer displaying how long the screen has been locked
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedInactive(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Re-verify instantly with Google Popup
  const handleGoogleReauth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user?.email?.toLowerCase().trim();

      if (userEmail && userEmail === adminEmail.toLowerCase().trim()) {
        onUnlock();
      } else {
        await signOut(auth).catch(() => {});
        setError(`Access denied. Google account (${userEmail || 'unknown'}) does not match the active admin session (${adminEmail}).`);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Verification cancelled. Please try again.');
      } else {
        setError(err.message || 'Google identity re-verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Request fresh OTP to admin inbox
  const handleSendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setIsSendingCode(true);
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });
      const data = await res.json();
      if (data.success) {
        setCodeSent(true);
        setSuccessMsg(data.message || `6-digit access code dispatched to ${adminEmail}.`);
      } else {
        setError(data.message || 'Failed to dispatch unlock code.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error sending unlock code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify OTP to resume session
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.trim().length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, otp: otpValue.trim() })
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem('tizzitech_admin_token', data.token);
        sessionStorage.setItem('tizzitech_admin_email', adminEmail);
        onUnlock();
      } else {
        setError(data.message || 'Invalid or expired access code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-overlay-title"
    >
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Amber security glow line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent"></div>

        {/* Lock icon with pulse ring */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/5">
              <Lock className="h-8 w-8 text-amber-400" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <h2 id="lock-overlay-title" className="text-xl font-bold tracking-tight text-white mb-1.5 font-sans">
            Session Locked Due to Inactivity
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mb-5 font-sans">
            Your administrative session was paused after 5 minutes of inactivity to protect sensitive customer and store data.
          </p>

          {/* Session Metadata Capsule */}
          <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl px-4 py-3 mb-6 text-left flex items-center justify-between text-xs font-sans">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Active Account</span>
              <span className="text-neutral-200 font-mono text-[11px] truncate block max-w-[210px]">{adminEmail}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Inactive For</span>
              <span className="text-amber-400 font-mono font-bold text-[11px]">{formatElapsed(elapsedInactive)}</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2.5 items-start animate-shake text-left">
            <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex gap-2.5 items-start text-left">
            <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300 font-medium leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* Method 1: Google Identity Re-verification */}
        {unlockMethod === 'google' ? (
          <div className="space-y-4 font-sans">
            <button
              type="button"
              onClick={handleGoogleReauth}
              disabled={loading}
              className="w-full bg-neutral-100 hover:bg-white text-black font-bold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Verifying Identity...' : 'Confirm Identity with Google'}
            </button>

            <button
              type="button"
              onClick={() => {
                setUnlockMethod('otp');
                if (!codeSent) handleSendOtp();
              }}
              className="w-full py-2.5 px-4 bg-transparent hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-xl text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="h-3.5 w-3.5 text-neutral-400" />
              <span>Or unlock with 6-digit email code</span>
            </button>
          </div>
        ) : (
          /* Method 2: 6-digit Email OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4 font-sans">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 text-center">
                6-Digit Email Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                value={otpValue}
                onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3.5 text-center text-white text-2xl tracking-[0.6em] focus:outline-none focus:border-amber-500 transition-colors font-mono"
                required
              />
              <p className="text-[11px] text-neutral-500 text-center mt-1.5">
                Sent to <span className="text-neutral-300 font-mono">{adminEmail}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={otpValue.length !== 6 || loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Resume Session</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingCode}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold tracking-wide uppercase transition-colors disabled:opacity-50"
              >
                {isSendingCode ? 'Sending...' : 'Resend Code'}
              </button>

              <button
                type="button"
                onClick={() => setUnlockMethod('google')}
                className="text-[11px] text-neutral-400 hover:text-white font-medium transition-colors"
              >
                Switch to Google
              </button>
            </div>
          </form>
        )}

        {/* Complete Logout Option */}
        <div className="mt-6 pt-5 border-t border-neutral-900 text-center">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-red-400 transition-colors font-medium tracking-wide"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out completely instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
