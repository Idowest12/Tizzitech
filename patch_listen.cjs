const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/app\.listen\(PORT,\s*'0\.0\.0\.0',\s*\(\)\s*=>\s*\{\s*console\.log\(`Server running on port \$\{PORT\}`\);\s*\}\);/g, `
    if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(\`Server running on port \$\{PORT\}\`);
      });
    }
`.trim());

fs.writeFileSync('server.ts', code);
