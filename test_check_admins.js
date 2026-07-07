import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce"
});
const db = getFirestore(app, 'default');

async function test() {
  try {
    const snap = await getDocs(collection(db, 'admins'));
    console.log("Admins:");
    snap.docs.forEach(d => console.log(d.id, d.data()));
  } catch(e) { console.error("Error:", e.message); }
  process.exit(0);
}
test();
