import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const userConfig = {
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce",
  storageBucket: "tizzitech-ecommerce.firebasestorage.app",
  messagingSenderId: "8769198058",
  appId: "1:8769198058:web:dc0b2d000ef13441134493",
  measurementId: "G-FKPEDWCBQ6"
};

const destApp = initializeApp(userConfig, 'dest');
const destDb = getFirestore(destApp);

async function test() {
  for (let i = 0; i < 30; i++) {
    try {
      await setDoc(doc(destDb, 'system', 'ping'), { timestamp: Date.now() });
      console.log("Database is ready!");
      process.exit(0);
    } catch (e) {
      console.log(`Attempt ${i+1} failed with code:`, e.code);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  console.log("Database not ready after 5 minutes.");
  process.exit(1);
}
test();
