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
    const orderId = `TZ${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newOrderData = {
      id: orderId,
      fullname: "John",
      email: "test@test.com",
      address: "123 Main",
      paymentOption: "Card",
      total: 100,
      status: 'Pending',
      orderDate: new Date().toISOString(),
      items: [{ id: "p22", price: 100, quantity: 1 }],
      userId: null
    };

    await runTransaction(db, async (t) => {
      const orderRef = doc(db, 'orders', orderId);
      t.set(orderRef, newOrderData);
    });
    console.log("Success creating order");
  } catch(e) { console.error("Error:", e.message); }
  process.exit(0);
}
test();
