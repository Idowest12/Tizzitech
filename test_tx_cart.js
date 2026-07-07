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
      transaction.update(pRef, { stock: pDoc.data().stock - 1 });
      
      const orderRef = doc(db, 'orders', 'TEST_ORDER_123');
      transaction.set(orderRef, {
        id: 'TEST_ORDER_123',
        fullname: "Test",
        email: "test@test.com",
        address: "Test address",
        paymentOption: "Cash",
        total: 100,
        status: 'Pending',
        orderDate: new Date().toISOString(),
        items: [{ id: "p22", price: 100, quantity: 1 }],
        userId: "uid123"
      });
    });
    console.log("Tx success CART");
  } catch(e) { console.error("Tx error:", e.message); }
  process.exit(0);
}
test();
