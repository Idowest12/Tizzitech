import * as admin from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "tizzitech-ecommerce"
});
const db = admin.firestore();
async function run() {
  try {
    const snap = await db.collection('orders').limit(1).get();
    console.log("Success! Docs:", snap.size);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
