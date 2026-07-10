const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const replacement = `  try {
    let adminDocs = await getDocs(query(collection(firebasedb, 'admins'), where('email', '==', email)));
    
    if (adminDocs.empty) {
      const allAdmins = await getDocs(collection(firebasedb, 'admins'));
      if (allAdmins.empty && email === 'idowutosin70@gmail.com') {
         const docId = getDocId(email);
         await setDoc(doc(firebasedb, 'admins', docId), { email, addedAt: new Date().toISOString() });
         adminDocs = await getDocs(query(collection(firebasedb, 'admins'), where('email', '==', email)));
      }
    }

    if (adminDocs.empty) {`;

code = code.replace(/  try \{\n    const adminDocs = await getDocs\(query\(collection\(firebasedb, 'admins'\), where\('email', '==', email\)\)\);\n    if \(adminDocs\.empty\) \{/g, replacement);

fs.writeFileSync('server.ts', code);
