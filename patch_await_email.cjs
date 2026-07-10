const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Use regex to find sendEmail calls that are not awaited and await them
// Actually, it's safer to just replace `.catch(...)` with await and a try-catch, but a quick fix is just adding `await `.

code = code.replace(/sendEmail\((.*?)\)\.catch\((.*?)\);/g, 'await sendEmail($1).catch($2);');

fs.writeFileSync('server.ts', code);
