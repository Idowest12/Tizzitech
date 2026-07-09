const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace("const crypto = require('crypto');", "import crypto from 'crypto';");

fs.writeFileSync('server.ts', code);
