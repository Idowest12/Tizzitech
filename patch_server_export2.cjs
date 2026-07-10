const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/export default app;/, 'module.exports = app;');

fs.writeFileSync('server.ts', code);
