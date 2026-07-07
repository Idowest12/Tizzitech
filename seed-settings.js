import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seedSettings() {
  const docRef = doc(db, 'settings', 'global');
  const d = await getDoc(docRef);
  let brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'Asus', 'iPhone', 'MacBook', 'HP', 'Lenovo'];
  let categories = ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair'];
  
  if (d.exists()) {
    const data = d.data();
    brands = Array.from(new Set([...brands, ...(data.brands || [])]));
    categories = Array.from(new Set([...categories, ...(data.categories || [])]));
  }
  
  await setDoc(docRef, { brands, categories }, { merge: true });
  console.log('Settings seeded');
  process.exit(0);
}

seedSettings().catch(e => { console.error(e); process.exit(1); });
