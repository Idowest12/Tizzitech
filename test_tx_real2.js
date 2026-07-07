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
    for (let d of pSnap.docs) {
       console.log(d.id, d.data().stock, typeof d.data().price);
       try {
         await runTransaction(db, async (t) => {
           t.update(d.ref, { stock: Math.max(0, d.data().stock - 1) });
         });
       } catch (e) {
         console.error("FAIL", d.id, e.message);
       }
    }
  } catch(e) { console.error("Tx error:", e.message); }
  process.exit(0);
}
test();
