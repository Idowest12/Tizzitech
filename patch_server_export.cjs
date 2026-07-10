const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace the boot() logic
const bootStr = `
async function boot() {
  app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', (req, res) => {
      if (req.path.startsWith('/admin')) {
         res.sendFile(path.join(distPath, 'admin.html'));
      } else {
         res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  // Only listen if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  }
}

boot();
export default app;
`;

// we need to find the boot() definition and replace it
code = code.replace(/async function boot\(\) \{[\s\S]*boot\(\);/, bootStr.trim());

fs.writeFileSync('server.ts', code);
