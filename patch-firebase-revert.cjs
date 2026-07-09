const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');

code = code.replace(
  "import { getFirestore, initializeFirestore } from 'firebase/firestore';",
  "import { getFirestore } from 'firebase/firestore';"
);

code = code.replace(
  "export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId);",
  "export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);"
);

fs.writeFileSync('src/firebase.ts', code);
