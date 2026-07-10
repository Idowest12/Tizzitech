const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  /    \} catch \(err: any\) \{\n      setError\(err\.message \|\| 'Authentication failed\.'\);\n      setAuthStep\('login'\);\n      signOut\(auth\);\n    \}/,
  `    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setAuthStep('login');
      signOut(auth);
      isManualLogin.current = false;
    }`
);

fs.writeFileSync('src/AdminApp.tsx', code);
