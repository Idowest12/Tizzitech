const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/import \{ getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc \} from 'firebase\/firestore';/g, "import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';");

code = code.replace(/const firebasedb = getFirebaseDb\(\);/g, "let firebasedb = getFirebaseDb();");
code = code.replace(/let firebasedb = getFirebaseDb\(\);\n  if \(\!firebasedb\) \{/g, "firebasedb = getFirebaseDb();\n  if (!firebasedb) {");

fs.writeFileSync('server.ts', code);
