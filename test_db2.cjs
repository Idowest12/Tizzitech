const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const snap = await getDocs(collection(db, 'products'));
    console.log('Success! Products:', snap.size);
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
