const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const testRoute = `
app.get('/api/test-vercel', (req, res) => {
  res.json({
    cwd: process.cwd(),
    dirname: __dirname,
    files: fs.readdirSync(process.cwd()),
    filesInApi: fs.existsSync(path.join(process.cwd(), 'api')) ? fs.readdirSync(path.join(process.cwd(), 'api')) : [],
    configExists: fs.existsSync(path.join(process.cwd(), 'firebase-applet-config.json')),
  });
});
`;

code = code.replace(/app\.listen/, testRoute + '\n  app.listen');

fs.writeFileSync('server.ts', code);
