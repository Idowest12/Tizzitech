import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const aiStudioConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const userConfig = {
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce",
  storageBucket: "tizzitech-ecommerce.firebasestorage.app",
  messagingSenderId: "8769198058",
  appId: "1:8769198058:web:dc0b2d000ef13441134493",
  measurementId: "G-FKPEDWCBQ6"
};

const sourceApp = initializeApp(aiStudioConfig, 'source');
const destApp = initializeApp(userConfig, 'dest');

const sourceDb = getFirestore(sourceApp, aiStudioConfig.firestoreDatabaseId);
const destDb = getFirestore(destApp);

async function checkDestReady() {
  for (let i = 0; i < 30; i++) {
    try {
      await setDoc(doc(destDb, 'system', 'ping'), { timestamp: Date.now() });
      console.log("Destination DB is ready!");
      return true;
    } catch (e) {
      console.log(`Waiting for DB to propagate... (${i+1}/30)`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  return false;
}

async function migrate() {
  const isReady = await checkDestReady();
  if (!isReady) {
    console.error("Failed: Database not ready after 5 minutes.");
    process.exit(1);
  }

  const collections = ['products', 'orders', 'settings', 'admins'];
  
  for (const col of collections) {
    console.log(`Migrating ${col}...`);
    try {
      const snap = await getDocs(collection(sourceDb, col));
      console.log(`Found ${snap.size} docs in ${col}`);
      for (const d of snap.docs) {
        await setDoc(doc(destDb, col, d.id), d.data());
      }
      console.log(`Finished ${col}`);
    } catch (e) {
      console.error(`Error migrating ${col}:`, e.message);
    }
  }
  console.log("Migration finished.");
  process.exit(0);
}

migrate();
