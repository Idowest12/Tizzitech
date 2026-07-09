const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /      const existQ = query\(collection\(db, 'newsletter_subscribers'\), where\('email', '==', email \|\| ''\)\);\n      const existSnap = await getDocs\(existQ\);\n      \n      if \(!existSnap\.empty\) \{\n        return res\.json\(\{ success: true, message: 'Already subscribed' \}\);\n      \}\n\n      const newSubRef = doc\(collection\(db, 'newsletter_subscribers'\)\);\n      await setDoc\(newSubRef, \{\n        email,\n        subscribedAt: new Date\(\)\.toISOString\(\),\n        status: 'active'\n      \}\);/m;

const replacement = `      const newSubRef = doc(db, 'newsletter_subscribers', email);
      try {
        await setDoc(newSubRef, {
          email,
          subscribedAt: new Date().toISOString(),
          status: 'active'
        });
      } catch (err) {
        if (err.code === 'permission-denied') {
          // If the document already exists, setDoc counts as an update which is denied by rules.
          // We can assume they are already subscribed.
          return res.json({ success: true, message: 'Already subscribed' });
        }
        throw err;
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
