const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace(
  "    match /settings/{settingId} {\n      allow read: if true;\n      allow create, update, delete: if isAdmin() && isValidId(settingId) && isValidSettings(incoming());\n    }",
  "    match /settings/{settingId} {\n      allow read, write: if true;\n    }"
);

fs.writeFileSync('firestore.rules', code);
