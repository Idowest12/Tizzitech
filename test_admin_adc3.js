import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { applicationDefault } from 'firebase-admin/app';

admin.initializeApp({
  credential: applicationDefault(),
  projectId: "tizzitech-ecommerce"
});
const db = getFirestore();
async function run() {
  try {
    const snap = await db.collection('orders').limit(1).get();
    console.log("Success! Docs:", snap.size);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
