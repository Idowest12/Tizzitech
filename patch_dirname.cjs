const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace('dirname: __dirname,', '');
fs.writeFileSync('server.ts', code);
