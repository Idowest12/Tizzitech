const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /        auth: \{\n          user: process\.env\.SMTP_USER,\n          pass: process\.env\.SMTP_PASS,\n        \},\n      \}\);/g,
  `        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });`
);

fs.writeFileSync('server.ts', code);
