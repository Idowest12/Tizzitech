const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.post\('\/api\/admin\/logout', \(req, res\) => \{\n  const \{ email \} = req\.body;\n  if \(email\) adminSessions\.delete\(email\);\n  res\.json\(\{ success: true \}\);\n\}\);[\s\S]*?\/\/ ========================================================/;

const fixed = `app.post('/api/admin/logout', (req, res) => {
  const { email } = req.body;
  if (email) adminSessions.delete(email);
  res.json({ success: true });
});

// ========================================================`;

fs.writeFileSync('server.ts', code.replace(regex, fixed));
