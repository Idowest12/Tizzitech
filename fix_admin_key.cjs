const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');
code = code.replace(`const [adminKey, setAdminKey] = useState('');\n`, '');
fs.writeFileSync('src/AdminApp.tsx', code);
