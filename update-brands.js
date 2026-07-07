import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function updateBrands() {
  const docRef = db.collection('settings').doc('global');
  const doc = await docRef.get();
  let currentBrands = [];
  if (doc.exists && doc.data().brands) {
    currentBrands = doc.data().brands;
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
    await docRef.set({ brands: currentBrands }, { merge: true });
    console.log('Brands updated successfully:', currentBrands);
  } else {
    console.log('Brands already contain the requested items:', currentBrands);
  }
}

updateBrands().catch(console.error);
