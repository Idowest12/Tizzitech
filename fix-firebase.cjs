const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');

code = code.replace(/import \{ getFirestore, initializeFirestore \} from 'firebase\/firestore';/, "import { getFirestore, initializeFirestore, setDoc, doc } from 'firebase/firestore';");

fs.writeFileSync('src/firebase.ts', code);
