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
      items: [...cart],
      total: 100,
      status: 'Confirmed',
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date().toISOString()
    };

    await runTransaction(db, async (transaction) => {
      const productRefs = cart.map(item => doc(db, 'products', item.id));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
      productDocs.forEach((pDoc, index) => {
        const currentStock = pDoc.data().stock;
        const newStock = currentStock - cart[index].quantity;
        transaction.update(productRefs[index], { stock: newStock });
      });
      const orderRef = doc(db, 'orders', orderId);
      transaction.set(orderRef, newOrderData);
    });
    console.log("Tx success with order create");
  } catch(e) { console.error("Tx error:", e.message); }
  process.exit(0);
}
test();
