const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

// Insert useRef
if (!code.includes('useRef')) {
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}

code = code.replace(
  /  const \[auditLogs, setAuditLogs\] = useState<any\[\]>\(\[\]\);\n\n  \/\/ Load auth state from session/,
  `  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const isManualLogin = useRef(false);

  // Load auth state from session`
);

code = code.replace(
  /            \} else \{\n              \/\/ Stale Firebase session without a valid custom admin session\.\n              \/\/ We log them out so they can click "Sign in with Google" again\.\n              await signOut\(auth\);\n            \}/,
  `            } else {
              // Stale Firebase session without a valid custom admin session.
              if (!isManualLogin.current) {
                // We log them out so they can click "Sign in with Google" again.
                await signOut(auth);
              }
            }`
);

code = code.replace(
  /  const handleLogin = async \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    setError\(''\);\n    \n    try \{/,
  `  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    isManualLogin.current = true;
    
    try {`
);

fs.writeFileSync('src/AdminApp.tsx', code);
