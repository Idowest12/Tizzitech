const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

// Replace the entire useEffect and handleLogin block
const startIdx = code.indexOf('// Load auth state from session');
const endIdx = code.indexOf('const handleVerifyOtp =');

if (startIdx !== -1 && endIdx !== -1) {
  const newAuthCode = `// Load auth state from session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email) {
          try {
            const valRes = await fetch('/api/admin/validate-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email })
            });
            const valData = await valRes.json();
            
            if (valData.valid) {
              setAdminEmail(user.email);
              logAuditActivity('LOGIN_ATTEMPT', 'Successful auto-login via valid session', user.email);
              setIsAuthenticated(true);
            } else {
              // Stale Firebase session without a valid custom admin session.
              // We log them out so they can click "Sign in with Google" again.
              await signOut(auth);
            }
          } catch(e) { console.error(e); }
        } else {
          signOut(auth);
          setError('Unauthorized: Your email is not registered as an administrator.');
        }
      } else {
        // Logged out
      }
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any));
    }, (err) => console.warn('Products read permission denied:', err.message));

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map(d => d.data() as any));
    }, (err) => console.warn('Orders read permission denied:', err.message));
      
    const unsubAuditLogs = onSnapshot(collection(db, 'audit_logs'), (snap) => {
      const logs = snap.docs.map(d => d.data());
      logs.sort((a, b) => b.timestamp - a.timestamp);
      setAuditLogs(logs);
    }, (err) => console.warn('Audit logs read permission denied:', err.message));

    return () => {
      unsubscribe();
      unsubProducts();
      unsubOrders();
      unsubAuditLogs();
    };
  }, []); // Run once on mount

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' }); // Force account selection
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      
      if (!user.email) throw new Error('No email found in Google profile');
      
      setAdminEmail(user.email);
      setAuthStep('otp');
      
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      
      if (data.devOtp) {
        console.log("DEV OTP:", data.devOtp); // For dev preview
        alert("SMTP is not configured! Simulated Email OTP: " + data.devOtp + "\\n\\nPlease configure SMTP_HOST, SMTP_USER, SMTP_PASS in the Environment settings for real emails to work.");
      }
      
      // Keep token fresh if needed
      const token = await user.getIdToken();
      if (token) {
        sessionStorage.setItem('tizzitech_admin_token', token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setAuthStep('login');
      signOut(auth);
    }
  };

  `;
  
  code = code.substring(0, startIdx) + newAuthCode + code.substring(endIdx);
  fs.writeFileSync('src/AdminApp.tsx', code);
  console.log("Patched successfully!");
} else {
  console.log("Could not find start/end indices");
}
