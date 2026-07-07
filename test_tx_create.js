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
        fullname: "Test",
        email: "test@test.com",
        address: "Test address",
        paymentOption: "Cash",
        total: 100,
        status: 'Pending',
        orderDate: new Date().toISOString(),
        items: [{ id: "p22", price: 100, quantity: 1 }],
        userId: "uid123"
      };

    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      transaction.set(orderRef, newOrderData);
    });
    console.log("Tx success create");
  } catch(e) { console.error("Tx error:", e.message); }
  process.exit(0);
}
test();
