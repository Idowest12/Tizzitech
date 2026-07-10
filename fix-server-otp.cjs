const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');
const startIdx = lines.findIndex((l, i) => l.includes('// ========================================================') && i > 1500);
lines.splice(startIdx);
fs.writeFileSync('server.ts', lines.join('\n') + '\n');
