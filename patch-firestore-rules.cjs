const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

const newRules = `
    match /admin_otps/{docId} {
      allow get, create, update, delete: if true;
      allow list: if false;
    }
    match /admin_sessions/{docId} {
      allow get, create, update, delete: if true;
      allow list: if false;
    }
    match /admins/{adminId} {
`;

code = code.replace("match /admins/{adminId} {", newRules.trim() + " {");
fs.writeFileSync('firestore.rules', code);
