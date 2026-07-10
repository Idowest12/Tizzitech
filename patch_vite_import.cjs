const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Remove static import
code = code.replace(/import\s+\{\s*createServer\s+as\s+createViteServer\s*\}\s+from\s+'vite';\n/, '');

// Fix boot()
const newBoot = `
async function boot() {
  app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
`;

code = code.replace(/async function boot\(\) \{\n  app\.get\('\/admin', \(req, res\) => \{\n    res\.redirect\('\/admin\.html'\);\n  \}\);\n\n  if \(process\.env\.NODE_ENV !== 'production'\) \{\n    const vite = await createViteServer\(\{\n      server: \{ middlewareMode: true \},\n      appType: 'spa',\n    \}\);\n    app\.use\(vite\.middlewares\);\n  \} else \{/, newBoot.trim() + ' {');

fs.writeFileSync('server.ts', code);
