const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /    \} catch \(err: any\) \{\n      console\.error\(`\[EMAIL FAILED\] to \$\{to\}:`, err\.message\);\n    \}/,
  `    } catch (err: any) {
      console.error(\`[EMAIL FAILED] to \${to}:\`, err.message);
      throw err;
    }`
);

fs.writeFileSync('server.ts', code);
