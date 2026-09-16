import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, MailCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface VerifyEmailViewProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VerifyEmailView({ token, onSuccess, onCancel }: VerifyEmailViewProps) {
  const { user, profile, updateProfile } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage('No verification token provided.');
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (!isMounted) return;

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been verified successfully!');
          if (profile) {
            updateProfile({ ...(profile as any), emailVerified: true });
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification link is invalid or has expired.');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage('Failed to connect to verification server. Please try again.');
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-[80vh] bg-black text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="flex justify-center mb-6">
          {status === 'verifying' && (
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black mb-3 tracking-tight">
          {status === 'verifying' && 'Verifying Email'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
          {message}
        </p>

        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-400 flex items-center gap-3 text-left">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>Your account is now fully secured and unrestricted for orders & tracking.</span>
            </div>
            <button
              onClick={onSuccess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 text-sm uppercase tracking-wider"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <button
              onClick={onCancel}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              Return to Store
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
