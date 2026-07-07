const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');
code = code.replace(/const firebaseConfig = \{[\s\S]*?\};/, "import firebaseConfig from '../firebase-applet-config.json';");
code = code.replace('export const db = getFirestore(app);', 'export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);');
fs.writeFileSync('src/firebase.ts', code);
