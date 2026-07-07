import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function updateBrands() {
  const docRef = doc(db, 'settings', 'global');
  const d = await getDoc(docRef);
  let currentBrands = [];
  if (d.exists() && d.data().brands) {
    currentBrands = d.data().brands;
  }
  
  const brandsToAdd = ['iPhone', 'MacBook', 'HP', 'Lenovo'];
  let updated = false;
  
  for (const b of brandsToAdd) {
    if (!currentBrands.includes(b)) {
      currentBrands.push(b);
      updated = true;
    }
  }
  
  if (updated) {
    await setDoc(docRef, { brands: currentBrands }, { merge: true });
    console.log('Brands updated successfully:', currentBrands);
  } else {
    console.log('Brands already contain the requested items:', currentBrands);
  }
  process.exit(0);
}

updateBrands().catch(e => { console.error(e); process.exit(1); });
