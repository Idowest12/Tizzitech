const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const configRaw = fs.readFileSync(configPath, 'utf-8');
const firebaseConfig = JSON.parse(configRaw);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

getDocs(collection(db, 'products')).then(snapshot => {
  snapshot.docs.forEach(d => {
    const data = d.data();
    if (data.stock === 0) {
      updateDoc(d.ref, { stock: 100 }).then(() => console.log('Updated ' + d.id));
    }
  });
}).catch(console.error);
