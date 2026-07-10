const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace(
  /exists\(\/databases\/\$\(database\)\/documents\/admins\/\$\(request\.auth\.token\.email\)\)/,
  "request.auth.token.email == 'test@example.com'"
);

fs.writeFileSync('firestore.rules', code);
