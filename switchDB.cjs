const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// 1. Init
code = code.replace(
  /\/\/ Configure Supabase connection[\s\S]*?function getSupabaseClient\(\): SupabaseClient \| null \{[\s\S]*?return null;\n  \}\n\}/,
  `import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import fs from 'fs';

let firebaseDb: any = null;
function getFirebaseDb() {
  if (firebaseDb) return firebaseDb;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.log('Firebase config tracking missing.');
      return null;
    }
    const configRaw = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(configRaw);
    const app = initializeApp(firebaseConfig);
    firebaseDb = getFirestore(app);
    console.log('Successfully initialized connection to Firebase.');
    return firebaseDb;
  } catch (err: any) {
    console.log('Firebase init error', err.message);
    return null;
  }
}`
);

// Replace getSupabaseClient references
code = code.replace(/const supabase = getSupabaseClient\(\);/g, 'const db = getFirebaseDb();');
code = code.replace(/if \(supabase\)/g, 'if (db)');

// /api/products GET
code = code.replace(
  /const \{ data, error \} = await supabase\.from\('products'\)\.select\('\*'\);\n\s+if \(error\) throw error;\n\s+\/\/ Auto seed if completely empty\n\s+if \(data && data\.length === 0\) \{[\s\S]*?return res\.json\(newData \|\| fallbackProducts\);\n\s+\}\n\s+return res\.json\(data\);/g,
  `const q = collection(db, 'products');
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((d: any) => d.data());
      
      if (data.length === 0) {
        console.log("Database table is empty, attempting to auto-seed initial products...");
        const productsToSeed = fallbackProducts.map(({ id, name, brand, category, price, condition, specs, description, stock, imageUrl }) => ({
          id, name, brand, category, price, condition, specs, description, stock, imageUrl
        }));
        await Promise.all(productsToSeed.map(p => setDoc(doc(db, 'products', p.id), p)));
        return res.json(productsToSeed);
      }
      return res.json(data);`
);

// /api/orders POST
code = code.replace(
  /\/\/ Insert order entry[\s\S]*?if \(productError && productData\) \{\n\s+const newStock = Math\.max\(0, productData\.stock - item\.quantity\);\n\s+await supabase\.from\('products'\)\.update\(\{ stock: newStock \}\)\.eq\('id', item\.id\);\n\s+\}\n\s+\}/g,
  `      // Insert order entry
      await setDoc(doc(db, 'orders', orderId), {
        id: orderId, user_id: userId || null, fullname, email, address,
        payment_option: paymentOption, total, status: 'Confirmed',
        order_date: orderDate.toISOString(), expected_delivery_date: expectedDeliveryDate.toISOString()
      });

      // Insert associated items
      for (const item of items) {
        const orderItemId = \`oi\${Math.random().toString(36).substring(2, 8)}\`;
        await setDoc(doc(db, 'order_items', orderItemId), {
          id: orderItemId, order_id: orderId, product_id: item.id,
          price: item.price, quantity: item.quantity
        });

        const prodRef = doc(db, 'products', item.id);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
           const productData = prodSnap.data() as any;
           const newStock = Math.max(0, (productData.stock || 0) - item.quantity);
           await updateDoc(prodRef, { stock: newStock });
        }
      }`
);
code = code.replace(/if \(!productError && productData\) \{[\s\S]*?eq\('id', item\.id\);\n\s+\}\n\s+\}/g, '');

// admin patch stock
code = code.replace(
  /const \{ error \} = await supabase\.from\('products'\)\.update\(\{ stock \}\)\.eq\('id', productId\);\n\s+if \(error\) throw error;/g,
  `await updateDoc(doc(db, 'products', productId), { stock });`
);

// /api/admin/orders GET
code = code.replace(
  /const \{ data: ordersRows, error: ordersError \} = await supabase\n\s+\.from\('orders'\)\n\s+\.select\('\*'\)\n\s+\.order\('order_date', \{ ascending: false \}\);\n\n\s+if \(ordersError\) throw ordersError;\n\n\s+const ordersData = \[\];\n\s+for \(const order of \(ordersRows \|\| \[\]\)\) \{\n\s+const \{ data: itemsRows, error: itemsError \} = await supabase\n\s+\.from\('order_items'\)\n\s+\.select\('\*, products\(name, brand, category, imageUrl\)'\)\n\s+\.eq\('order_id', order\.id\);\n\n\s+if \(itemsError\) throw itemsError;\n\n\s+ordersData\.push\(\{/g,
  `const ordersSnap = await getDocs(collection(db, 'orders'));
      let ordersRows = ordersSnap.docs.map((d: any) => d.data());
      ordersRows.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

      const ordersData = [];
      for (const order of ordersRows) {
        const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', order.id));
        const itemsSnap = await getDocs(itemsQ);
        
        const itemsArray = [];
        for (const iDoc of itemsSnap.docs) {
           const iData = iDoc.data();
           let pData: any = null;
           const pSnap = await getDoc(doc(db, 'products', iData.product_id));
           if (pSnap.exists()) pData = pSnap.data();
           itemsArray.push({
             id: iData.product_id, name: pData?.name, brand: pData?.brand,
             category: pData?.category, price: iData.price, quantity: iData.quantity,
             imageUrl: pData?.imageUrl
           });
        }
        const itemsRows = itemsArray;
        ordersData.push({`
);

code = code.replace(
  /items: \(itemsRows \|\| \[\]\)\.map\(\(i: any\) => \(\{\n\s+id: i\.product_id,\n\s+name: i\.products\?\.name,\n\s+brand: i\.products\?\.brand,\n\s+category: i\.products\?\.category,\n\s+price: i\.price,\n\s+quantity: i\.quantity,\n\s+imageUrl: i\.products\?\.imageUrl\n\s+\}\)\)/g,
  `items: itemsRows`
);

// admin map items fix for users orders
code = code.replace(
  /const \{ data: itemsRows \} = await supabase\n\s+\.from\('order_items'\)\n\s+\.select\('\*, products\(name, brand, category, imageUrl\)'\)\n\s+\.eq\('order_id', order\.id\);\n\n\s+ordersData\.push\(\{/g,
  `const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', order.id));
        const itemsSnap = await getDocs(itemsQ);
        const itemsArray = [];
        for (const iDoc of itemsSnap.docs) {
           const iData = iDoc.data();
           let pData: any = null;
           const pSnap = await getDoc(doc(db, 'products', iData.product_id));
           if (pSnap.exists()) pData = pSnap.data();
           itemsArray.push({
             id: iData.product_id, name: pData?.name, brand: pData?.brand,
             category: pData?.category, price: iData.price, quantity: iData.quantity,
             imageUrl: pData?.imageUrl
           });
        }
        const itemsRows = itemsArray;
        ordersData.push({`
);

// admin patch order status
code = code.replace(
  /const \{ error \} = await supabase\.from\('orders'\)\.update\(\{ status \}\)\.eq\('id', orderId\);\n\s+if \(error\) throw error;/g,
  `await updateDoc(doc(db, 'orders', orderId), { status });`
);

// new product insert
code = code.replace(
  /const \{ error \} = await supabase\.from\('products'\)\.insert\(\{[\s\S]*?imageUrl\n\s+\}\);\n\s+if \(error\) throw error;/g,
  `await setDoc(doc(db, 'products', id), newProduct);`
);

// seed DB list
code = code.replace(
  /const \{ error \} = await supabase\.from\('products'\)\.upsert\(productsToSeed\);\n\s+if \(error\) throw error;/g,
  `await Promise.all(productsToSeed.map((p: any) => setDoc(doc(db, 'products', p.id), p)));`
);

// db test supabase
code = code.replace(
  /const supabaseClient = getSupabaseClient\(\);\n\s+if \(\!supabaseClient\) \{/g,
  `const firebasedb = getFirebaseDb();
  if (!firebasedb) {`
);

// /api/auth/register
code = code.replace(
  /const \{ data: existingUser \} = await supabase\.from\('users'\)\.select\('id'\)\.eq\('email', email\)\.single\(\);\n\s+if \(existingUser\) return res\.status\(400\)\.json\(\{ success: false, message: 'Email already registered' \}\);\n\n\s+const \{ error \} = await supabase\.from\('users'\)\.insert\(\{\n\s+id: userId,\n\s+email,\n\s+password: hashedPassword,\n\s+firstname: firstName,\n\s+lastname: surname,\n\s+address,\n\s+phone,\n\s+role: 'user'\n\s+\}\);\n\s+if \(error\) throw error;/g,
  `const existQ = query(collection(db, 'users'), where('email', '==', email));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) return res.status(400).json({ success: false, message: 'Email already registered' });

      await setDoc(doc(db, 'users', userId), {
        id: userId, email, password: hashedPassword,
        firstname: firstName, lastname: surname, address, phone, role: 'user'
      });`
);

// google login
code = code.replace(
  /let \{ data: user, error \} = await supabase\.from\('users'\)\.select\('\*'\)\.eq\('email', email\)\.single\(\);\n\s+let userId = user\?\.id;\n\s+if \(\!user\) \{\n\s+\/\/ Create user\n\s+userId = `U\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 10\)\.toUpperCase\(\)\}`;\n\s+const \{ error: insertErr \} = await supabase\.from\('users'\)\.insert\(\{\n\s+id: userId,\n\s+email,\n\s+password: 'oauth_user_no_password',\n\s+firstname: firstName,\n\s+lastname: surname,\n\s+role: 'user'\n\s+\}\);\n\s+if \(insertErr\) throw insertErr;\n\s+user = \{ id: userId, email, firstname: firstName, lastname: surname, role: 'user' \};\n\s+\}/g,
  `const existQ = query(collection(db, 'users'), where('email', '==', email));
        const existSnap = await getDocs(existQ);
        let user: any = null;
        if (!existSnap.empty) user = existSnap.docs[0].data();
        let userId = user?.id;
        
        if (!user) {
          userId = \`U\${Math.random().toString(36).substring(2, 10).toUpperCase()}\`;
          user = {
            id: userId, email, password: 'oauth_user_no_password',
            firstname: firstName, lastname: surname, role: 'user'
          };
          await setDoc(doc(db, 'users', userId), user);
        }`
);

// standard login
code = code.replace(
  /const \{ data: user, error \} = await supabase\.from\('users'\)\.select\('\*'\)\.eq\('email', email\)\.single\(\);\n\s+if \(error \|\| \!user\) throw new Error\('User not found in Supabase or Supabase error'\);/g,
  `const existQ = query(collection(db, 'users'), where('email', '==', email));
      const existSnap = await getDocs(existQ);
      let user: any = null;
      if (!existSnap.empty) user = existSnap.docs[0].data();
      if (!user) throw new Error('User not found in Firestore');`
);

// /api/users/:userId/orders
code = code.replace(
  /const \{ data: ordersRows, error: ordersError \} = await supabase\n\s+\.from\('orders'\)\n\s+\.select\('\*'\)\n\s+\.eq\('user_id', userId\)\n\s+\.order\('order_date', \{ ascending: false \}\);\n\n\s+if \(ordersError\) throw ordersError;/g,
  `const ordersQ = query(collection(db, 'orders'), where('user_id', '==', userId));
      const ordersSnap = await getDocs(ordersQ);
      let ordersRows = ordersSnap.docs.map((d: any) => d.data());
      ordersRows.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());`
);

code = code.replace(/Supabase/g, 'Firestore');
code = code.replace(/supabase/g, 'firestore');

fs.writeFileSync('server.ts', code);
console.log('Done replacement');
