const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

// Revert imports
code = code.replace(
  `import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';`,
  `import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';`
);

// Revert state variables
code = code.replace(
  `const [adminKey, setAdminKey] = useState('');
  const [emailMsg, setEmailMsg] = useState('');`,
  `const [adminKey, setAdminKey] = useState('');`
);

// Revert useEffect
code = code.replace(
  /\/\/ Check if coming from email link[\s\S]*?const unsubscribe = onAuthStateChanged\(auth, \(user\) => \{/,
  `const unsubscribe = onAuthStateChanged(auth, (user) => {`
);

// Revert auth state logic to check email specifically
code = code.replace(
  `if (user) {
        // You can add logic to verify if the user's email is an admin email
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }`,
  `if (user) {
        if (user.email === 'idowutosin70@gmail.com') {
          setIsAuthenticated(true);
        } else {
          signOut(auth);
          setError('Unauthorized: Your email is not registered as an administrator.');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }`
);

// Revert handleLogin
code = code.replace(
  /const handleLogin = async \(e: React\.FormEvent\) => \{[\s\S]*?catch \(err: any\) \{\s*setError\(err\.message \|\| 'Authentication failed\.'\);\s*\}\s*\};/,
  `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    }
  };`
);

// Revert UI to Google Sign In button
code = code.replace(
  /<label className="block text-\[10px\] font-bold text-neutral-500 uppercase tracking-widest mb-2">[\s\S]*?<\/div>/,
  `<p className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 text-center">
                SIGN IN WITH GOOGLE
              </p>`
);

// Revert UI buttons
code = code.replace(
  `<button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] mt-6 tracking-wide"
            >
              AUTHENTICATE PORTAL
            </button>`,
  `<button 
              type="button"
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] mt-6 tracking-wide flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-1" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign In with Google
            </button>`
);

code = code.replace(
  /\{emailMsg && \([\s\S]*?\{error && \(/,
  `{error && (`
);

fs.writeFileSync('src/AdminApp.tsx', code);
