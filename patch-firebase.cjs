const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');

code = code.replace(
  /import \{ getFirestore \} from 'firebase\/firestore';/,
  "import { getFirestore, setDoc, doc } from 'firebase/firestore';"
);

fs.writeFileSync('src/firebase.ts', code);
