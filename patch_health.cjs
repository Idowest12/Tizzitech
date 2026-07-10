const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace("app.get('/api/debug-routes',", "app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });\napp.get('/api/debug-routes',");
fs.writeFileSync('server.ts', code);
