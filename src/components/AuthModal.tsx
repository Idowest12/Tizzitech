import React, { useState } from 'react';
import { X, Mail, Lock, User, MapPin, Tag, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithGoogle, registerWithEmail, loginWithEmail, resetPassword, user } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [address, setAddress] = useState('');
  const [codename, setCodename] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isReset) {
        await resetPassword(email);
        setResetSent(true);
        setTimeout(() => {
          setIsReset(false);
          setResetSent(false);
        }, 5000);
      } else if (isLogin) {
        await loginWithEmail(email, password);
        onClose();
      } else {
        await registerWithEmail(email, password, {
          firstName,
          surname,
          address,
          codename,
          phone
        });
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. The site administrator needs to enable it in Firebase Console.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error: It seems your browser blocked the connection. If you are using an ad-blocker or brave shields, please disable them, or open the app in a New Tab.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for OAuth operations for your Firebase project. Please add ' + window.location.hostname + ' to the Authorized Domains list in your Firebase Console (Authentication > Settings > Authorized domains).');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again, or sign up if you do not have an account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered and in use. Please switch to the "Log In" view instead.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
        setLoading(true);
        await signInWithGoogle();
        onClose();
    } catch (err: any) {
        console.error("Google sign in error", err);
        setError(err.message || 'Google sign in failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {user && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="p-6 md:p-8 overflow-y-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                  {isReset ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create an Account')}
              </h2>
              <p className="text-neutral-400 text-sm">
                  {isReset 
                    ? 'Enter your email address to receive password reset instructions.' 
                    : (isLogin ? 'Sign in to access your orders and profile.' : 'Join Tizzitech to manage orders and track shipments.')}
              </p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                    {error}
                </div>
            )}
            
            {resetSent && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-500 text-sm text-center">
                    Password reset link sent to your email!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isReset && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-neutral-500" />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="block w-full rounded-xl border border-neutral-700 bg-neutral-950/50 py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Surname</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-neutral-500" />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        value={surname}
                                        onChange={(e) => setSurname(e.target.value)}
                                        className="block w-full rounded-xl border border-neutral-700 bg-neutral-950/50 py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Nick name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    value={codename}
                                    onChange={(e) => setCodename(e.target.value)}
                                    className="block w-full rounded-xl border border-neutral-700 bg-neutral-950/50 py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="e.g. Neo or TechGuru"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="block w-full rounded-xl border border-neutral-700 bg-neutral-950/50 py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="123 Tech Avenue, City"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Phone Number (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-neutral-500" />
                                </div>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full rounded-xl border border-neutral-700 bg-neutral-950/50 py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="+234 812 345 6789"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-neutral-500" />
                        </div>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-xl border border-neutral-700 bg-neutral-950/50 py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                {!isReset && (
                  <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-neutral-300">Password</label>
                        {isLogin && (
                          <button
                            type="button"
                            onClick={() => setIsReset(true)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-neutral-500" />
                          </div>
                          <input 
                              type="password" 
                              required
                              minLength={6}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full rounded-xl border border-neutral-700 bg-neutral-950/50 py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                              placeholder="••••••••"
                          />
                      </div>
                  </div>
                )}

                <button 
                    type="submit"
                    disabled={loading || resetSent}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70 mt-6"
                >
                    {loading ? 'Please wait...' : (isReset ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account'))}
                </button>
            </form>

            <div className="mt-6 flex items-center">
                <div className="flex-1 border-t border-neutral-800"></div>
                <span className="px-3 text-sm text-neutral-500">Or continue with</span>
                <div className="flex-1 border-t border-neutral-800"></div>
            </div>

            <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || resetSent}
                className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl border border-neutral-700 transition-colors active:scale-[0.98] disabled:opacity-70"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
            </button>

            <div className="mt-8 text-center text-sm text-neutral-400">
                {isReset ? (
                  <button 
                      type="button"
                      onClick={() => setIsReset(false)}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                      Back to Sign in
                  </button>
                ) : (
                  <>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                  </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
