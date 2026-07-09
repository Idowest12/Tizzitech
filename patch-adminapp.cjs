const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

const newImports = `
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
`;

code = code.replace(
  "import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';",
  newImports
);

const stateReplacements = `
export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'otp'>('login');
  const [otpValue, setOtpValue] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
`;

code = code.replace(
  "export default function AdminApp() {\n  const [isAuthenticated, setIsAuthenticated] = useState(false);",
  stateReplacements
);

const useeffectReplacement = `
  // Load auth state from session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'idowutosin70@gmail.com') {
          setAdminEmail(user.email);
          setAuthStep('otp');
          try {
            const res = await fetch('/api/admin/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email })
            });
            const data = await res.json();
            if (data.devOtp) {
              console.log("DEV OTP:", data.devOtp); // For dev preview
            }
          } catch (e) {
            console.error("Failed to send OTP", e);
          }
        } else {
          signOut(auth);
          setError('Unauthorized: Your email is not registered as an administrator.');
          setIsAuthenticated(false);
          setAuthStep('login');
        }
      } else {
        setIsAuthenticated(false);
        setAuthStep('login');
      }
    });
    return () => unsubscribe();
  }, []);
`;

code = code.replace(
  /\/\/ Load auth state from session[\s\S]*?\}, \[\]\);/,
  useeffectReplacement.trim()
);

const verifyOtpMethod = `
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, otp: otpValue })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
`;

code = code.replace(
  "  const handleLogout = async () => {",
  verifyOtpMethod.trim()
);


const authUi = `
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 font-sans text-neutral-300">
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle decoration lines */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6">
              {authStep === 'login' ? (
                <Lock className="h-8 w-8 text-blue-500 animate-pulse" />
              ) : (
                <KeyRound className="h-8 w-8 text-emerald-500 animate-pulse" />
              )}
            </div>
            <h1 className="text-2xl font-serif font-black text-white uppercase tracking-tight mb-2">
              ADMIN CONTROL PORTAL
            </h1>
            <p className="text-sm text-neutral-400 max-w-xs mb-8">
              {authStep === 'login' 
                ? 'Secured access system. Unauthorized entry attempts are logged.'
                : 'Please enter the 6-digit access code sent to your email.'}
            </p>
          </div>

          {authStep === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <p className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 text-center">
                  SIGN IN WITH GOOGLE
                </p>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start animate-shake">
                  <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                </div>
              )}
              <button 
                type="button"
                onClick={handleLogin}
                className="w-full bg-neutral-100 hover:bg-white text-black font-bold py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3 shadow-lg shadow-white/5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign In with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 text-center">
                  ACCESS CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value)}
                  placeholder="------"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-4 text-center text-white text-2xl tracking-[1em] focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start animate-shake">
                  <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                </div>
              )}
              <button 
                type="submit"
                disabled={otpValue.length !== 6 || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10"
              >
                {loading ? 'Verifying...' : 'Verify Access'}
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  signOut(auth);
                  setAuthStep('login');
                }}
                className="w-full mt-4 bg-transparent hover:text-white text-neutral-500 font-bold py-2 text-xs tracking-widest uppercase transition-colors"
              >
                Cancel
              </button>
            </form>
          )}

          {authStep === 'login' && (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full mt-6 bg-transparent hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-white font-bold py-3 px-6 rounded-xl text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Exit to Storefront
            </button>
          )}
        </div>
      </div>
    );
  }
`;

code = code.replace(
  /  if \(!isAuthenticated\) \{[\s\S]*?Exit to Storefront\n          <\/button>\n        <\/div>\n      <\/div>\n    \);\n  \}/,
  authUi.trim()
);

fs.writeFileSync('src/AdminApp.tsx', code);
