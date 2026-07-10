const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const email = 'idowutosin70@gmail.com';
    const id = email.replace(/[^a-zA-Z0-9]/g, '_');
    await setDoc(doc(db, 'admins', id), { email, addedAt: new Date().toISOString() });
    console.log('Seeded idowutosin70@gmail.com as admin!');
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
