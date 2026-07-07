const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = `import { collection, doc, getDoc, getDocs } from 'firebase/firestore';\nimport { db } from './firebase';\n` + code;

fs.writeFileSync('src/App.tsx', code);
