const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace(
  /function isAdmin\(\) \{\s*return isSignedIn\(\) && request\.auth\.token\.email == 'idowutosin70@gmail\.com';\s*\}/,
  `function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'idowutosin70@gmail.com' || 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email))
      );
    }`
);

code = code.replace(
  /match \/admins\/\{adminId\} \{ \{/,
  "match /admins/{adminId} {"
);

code = code.replace(
  /allow create, update, delete: if isAdmin\(\) && isValidId\(adminId\);/,
  "allow create, update, delete: if isAdmin();"
);

fs.writeFileSync('firestore.rules', code);
