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
    const cart = [{ id: "p22", price: 100, quantity: 1, name: "Sony" }];
    const newOrderData = {
        id: orderId,
        fullname: "User",
        email: "guest@example.com",
        address: "street, city, state lga",
        paymentOption: "Card",
        total: 100,
        status: 'Pending',
        orderDate: new Date().toISOString(),
        items: cart.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity
        })),
        userId: null,
        expectedDeliveryDate: new Date(Date.now() + 3*24*60*60*1000).toISOString()
    };

    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      transaction.set(orderRef, newOrderData);
    });
    console.log("Tx success with order create exact");
  } catch(e) { console.error("Tx error:", e.message); }
  process.exit(0);
}
test();
