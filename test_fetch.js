import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const userConfig = {
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce"
};
const app = initializeApp(userConfig);
const db = getFirestore(app, 'default');

async function test() {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    console.log("Found orders:", snap.size);
  } catch(e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}
test();
