const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /firebasedb = getFirebaseDb\(\);/g,
  "const firebasedb = getFirebaseDb();"
);

fs.writeFileSync('server.ts', code);
