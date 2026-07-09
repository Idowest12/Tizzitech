const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  "import { db, handleFirestoreError, OperationType } from './firebase';",
  "import { db, handleFirestoreError, OperationType, logAuditActivity } from './firebase';"
);

const useeffectReplacement = `
  // Load auth state from session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'idowutosin70@gmail.com') {
          setAdminEmail(user.email);
          
          try {
            const valRes = await fetch('/api/admin/validate-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email })
            });
            const valData = await valRes.json();
            if (valData.valid) {
              logAuditActivity('LOGIN_ATTEMPT', 'Successful auto-login via valid session', user.email);
              setIsAuthenticated(true);
              return;
            } else {
              logAuditActivity('LOGIN_ATTEMPT', 'Session invalid or hijacked - requiring OTP', user.email);
            }
          } catch(e) { console.error(e); }

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
        logAuditActivity('LOGIN_ATTEMPT', 'Successful OTP login', adminEmail);
        setIsAuthenticated(true);
      } else {
        logAuditActivity('LOGIN_ATTEMPT', 'Failed OTP login attempt', adminEmail);
        setError(data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      logAuditActivity('LOGIN_ATTEMPT', 'Error during OTP login', adminEmail);
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (adminEmail) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminEmail })
        });
      }
      await signOut(auth);
      sessionStorage.removeItem('tizzitech_admin_token');
      logAuditActivity('LOGOUT', 'Admin logged out', adminEmail || 'unknown');
    } catch(e) {
      console.error(e);
    }
  };
`;

code = code.replace(
  /  const handleVerifyOtp = async \(e: React\.FormEvent\) => \{[\s\S]*?const handleLogout = async \(\) => \{[\s\S]*?  \};/,
  verifyOtpMethod.trim()
);

const stockAndOrderUpdates = `
  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await updateDoc(doc(db, 'products', id), { stock: newStock });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
      logAuditActivity('STOCK_UPDATE', \`Updated stock for product \${id} to \${newStock}\`, adminEmail);
    } catch (e: any) {
      console.error("Error updating stock:", e);
      handleFirestoreError(e, OperationType.UPDATE, \`products/\${id}\`);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
      logAuditActivity('ORDER_UPDATE', \`Updated order \${id} status to \${newStatus}\`, adminEmail);
    } catch (e: any) {
      console.error("Error updating order status:", e);
      handleFirestoreError(e, OperationType.UPDATE, \`orders/\${id}\`);
    }
  };
`;

code = code.replace(
  /  const handleUpdateStock = async \(id: string, newStock: number\) => \{[\s\S]*?const handleAddProduct = async/,
  stockAndOrderUpdates.trim() + '\n\n  const handleAddProduct = async'
);

fs.writeFileSync('src/AdminApp.tsx', code);
