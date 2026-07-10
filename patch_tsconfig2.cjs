const fs = require('fs');
const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
tsconfig.include = ["src/**/*", "server.ts"];
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
