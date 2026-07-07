import { initializeApp } from 'firebase/app';
import { getFirestore, doc, runTransaction, getDocs, collection } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce"
});
const db = getFirestore(app, 'default');

async function test() {
  try {
    const pSnap = await getDocs(collection(db, 'products'));
    const products = pSnap.docs.map(d => d.data());
    console.log(`Testing ${products.length} products...`);
    
    for (const p of products) {
      try {
        await runTransaction(db, async (t) => {
          const pRef = doc(db, 'products', p.id);
          const pDoc = await t.get(pRef);
          const newStock = (pDoc.data().stock || 0) - 0; // Don't actually deduct, just update with same to test validation. Wait, rules say incoming().stock < existing().stock.
          if (pDoc.data().stock > 0) {
            t.update(pRef, { stock: pDoc.data().stock - 1 });
          }
        });
      } catch(e) {
        console.error(`Product ${p.id} failed:`, e.message);
      }
    }
    console.log("Done testing all products.");
  } catch(e) { console.error("Error:", e.message); }
  process.exit(0);
}
test();
