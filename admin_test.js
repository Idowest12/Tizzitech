import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const aiStudioConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp({
  projectId: aiStudioConfig.projectId
});
const db = getFirestore(app, aiStudioConfig.firestoreDatabaseId);

async function test() {
  try {
    const snap = await db.collection('orders').get();
    console.log("Read success, count:", snap.size);
  } catch(e) {
    console.log("Read failed:", e.message);
  }
}
test();
