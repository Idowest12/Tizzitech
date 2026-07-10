const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  /  const handleLogout = async \(\) => \{\n    try \{\n      await signOut\(auth\);\n      sessionStorage\.removeItem\('tizzitech_admin_token'\);\n    \} catch\(e\) \{\n      console\.error\(e\);\n    \}\n  \};/,
  `  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });
      await signOut(auth);
      sessionStorage.removeItem('tizzitech_admin_token');
      setIsAuthenticated(false);
      setAuthStep('login');
      setOtpValue('');
      setAdminEmail('');
    } catch(e) {
      console.error(e);
    }
  };`
);

fs.writeFileSync('src/AdminApp.tsx', code);
