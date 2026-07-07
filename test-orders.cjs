const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, getDoc, doc } = require('firebase/firestore');

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const configRaw = fs.readFileSync(configPath, 'utf-8');
const firebaseConfig = JSON.parse(configRaw);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function testOrders() {
  try {
    const ordersSnap = await getDocs(collection(db, 'orders'));
    let ordersRows = ordersSnap.docs.map((d) => d.data());
    
    // Sort orders
    ordersRows.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    
    const ordersData = [];
    for (const order of ordersRows) {
        const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', order.id));
        const itemsSnap = await getDocs(itemsQ);
                
        const itemsArray = [];
        for (const iDoc of itemsSnap.docs) {
           const iData = iDoc.data();
           let pData = null;
           const pSnap = await getDoc(doc(db, 'products', iData.product_id));
           if (pSnap.exists()) pData = pSnap.data();
           itemsArray.push({
             id: iData.product_id, name: pData?.name, brand: pData?.brand,
             category: pData?.category, price: iData.price, quantity: iData.quantity,
             imageUrl: pData?.imageUrl
           });
        }
        const itemsRows = itemsArray;
        ordersData.push({
          id: order.id,
          fullname: order.fullname,
          email: order.email,
          address: order.address,
          paymentOption: order.payment_option,
          total: order.total,
          status: order.status,
          orderDate: order.order_date,
          expectedDeliveryDate: order.expected_delivery_date,
          items: itemsRows
        });
    }
    console.log("Success! Data length:", ordersData.length);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
testOrders();
