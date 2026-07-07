import { initializeApp } from 'firebase/app';
import { getFirestore, doc, runTransaction } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce"
});
const db = getFirestore(app, 'default');

async function test() {
  try {
    await runTransaction(db, async (transaction) => {
      const pRef = doc(db, 'products', 'p22');
      const pDoc = await transaction.get(pRef);
      const newStock = pDoc.data().stock - 1;
      transaction.update(pRef, { stock: newStock });
    });
    console.log("Tx success with p22");
  } catch(e) { console.error("Tx error:", e.message); }
  process.exit(0);
}
test();
