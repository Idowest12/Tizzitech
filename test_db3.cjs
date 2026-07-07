const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    console.log('Success! Settings exists:', snap.exists());
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
