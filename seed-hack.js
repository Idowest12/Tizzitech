import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  const docRef = doc(db, 'newsletter_campaigns', 'global_settings');
  let brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'Asus', 'iPhone', 'MacBook', 'HP', 'Lenovo'];
  let categories = ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair'];
  
  await setDoc(docRef, { brands, categories }, { merge: true });
  console.log('Seeded hack settings');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
