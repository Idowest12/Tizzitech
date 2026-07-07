import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
const app = initializeApp({
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce"
});
const db = getFirestore(app, 'default');
async function test() {
  try {
    const q = query(collection(db, 'orders'), limit(1));
    const snap = await getDocs(q);
    console.log("Success:", snap.size);
  } catch(e) { console.error("Error:", e.message); }
  process.exit(0);
}
test();
