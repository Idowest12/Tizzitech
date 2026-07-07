const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const configRaw = fs.readFileSync(configPath, 'utf-8');
const firebaseConfig = JSON.parse(configRaw);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

getDocs(collection(db, 'products')).then(snapshot => {
  snapshot.docs.forEach(d => {
    console.log(d.id, d.data().name, d.data().stock);
  });
  process.exit(0);
}).catch(console.error);
