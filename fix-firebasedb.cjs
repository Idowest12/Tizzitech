const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/  const docId = getDocId\(email\);\n  const firebasedb = getFirebaseDb\(\);\n  \n  if \(\!firebasedb\) \{\n    return res\.status\(500\)\.json\(\{ success: false, message: 'Database not configured' \}\);\n  \}/g, "  const docId = getDocId(email);");

code = code.replace(/  const firebasedb = getFirebaseDb\(\);\n  if \(\!firebasedb\) \{\n     return res\.json\(\{ valid: false, reason: 'No DB' \}\);\n  \}\n\n  const sessionDocId = getDocId\(email \+ "_session"\);/g, "  const sessionDocId = getDocId(email + \"_session\");");

fs.writeFileSync('server.ts', code);
