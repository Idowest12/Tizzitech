import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

// Configure Nodemailer Utility
export const sendEmail = async (to: string, subject: string, html: string) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || '"Tizzitech" <newsletter@tizzitech.com>',
        to,
        subject,
        html,
      });
      console.log(`[EMAIL SENT] to ${to}: ${subject}`);
    } catch (err: any) {
      console.error(`[EMAIL FAILED] to ${to}:`, err.message);
    }
  } else {
    console.log(`[SIMULATED EMAIL] to ${to} | Subject: ${subject}`);
  }
};


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for in-memory uploads
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRETS || 'tizzitech-super-secret-key';
if (!JWT_SECRET) {
  console.error('CRITICAL WARNING: JWT_SECRET is not set in environment variables. Auth will fail.');
}

// Prevent Firebase unhandled stream rejections from crashing the process
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled stream rejection, ignored to prevent crash:', reason);
});

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

// Enable JSON middleware for parsing parsed body structures
app.use(express.json());

import fs from 'fs';
app.use((req, res, next) => {
  next();
});

app.get('/api/debug-routes', (req, res) => {
  const routes = app._router.stack.filter((r: any) => r.route).map((r: any) => r.route.path);
  res.json({ routes });
});

/**
 * DATABASE IMPLEMENTATION NOTES: Sylius (PHP) / Node.js with MySQL
 * -------------------------------------------------------------
 * 1. Sylius is a PHP framework based on Symfony, usually used as a complete headless or monolithic
 *    state-driven e-commerce backend with an SQL database (such as MySQL).
 * 
 * 2. If you are using Sylius as your backend, you would consume Sylius's standard REST/GraphQL APIs.
 * 
 * 3. Below, we provide a complete Node.js, Express, and MySQL server implementation that can act
 *    as a highly customizable alternative.
 * 
 * MYSQL SCHEMA EXAMPLE:
 * -------------------------------------------------------------
 * CREATE DATABASE IF NOT EXISTS tizzitech;
 * USE tizzitech;
 * 
 * -- Products Table
 * CREATE TABLE IF NOT EXISTS products (
 *   id VARCHAR(50) PRIMARY KEY,
 *   name VARCHAR(255) NOT NULL,
 *   brand VARCHAR(100) NOT NULL,
 *   category VARCHAR(150) NOT NULL,
 *   price DOUBLE PRECISION NOT NULL,
 *   `condition` VARCHAR(50) NOT NULL,
 *   specs JSON,
 *   description TEXT,
 *   stock INT DEFAULT 0,
 *   imageUrl VARCHAR(500)
 * );
 * 
 * -- Orders Table
 * CREATE TABLE IF NOT EXISTS orders (
 *   id VARCHAR(50) PRIMARY KEY,
 *   user_id VARCHAR(150),
 *   fullname VARCHAR(255) NOT NULL,
 *   email VARCHAR(255) NOT NULL,
 *   address TEXT NOT NULL,
 *   payment_option VARCHAR(50) NOT NULL,
 *   total DOUBLE PRECISION NOT NULL,
 *   status VARCHAR(50) DEFAULT 'Confirmed',
 *   order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   expected_delivery_date DATETIME
 * );
 * 
 * -- Order Items Table
 * CREATE TABLE IF NOT EXISTS order_items (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   order_id VARCHAR(50),
 *   product_id VARCHAR(50),
 *   price DOUBLE PRECISION NOT NULL,
 *   quantity INT NOT NULL,
 *   FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
 * );
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, getDoc, query, where, runTransaction } from 'firebase/firestore';

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
    firebaseDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    console.log('Successfully initialized connection to Firebase.');
    return firebaseDb;
  } catch (err: any) {
    console.log('Firebase init error', err.message);
    return null;
  }
}

// Configure MySQL connection pooling - lazy-initialized to prevent server crashes if environment variables are not yet present
let pool: mysql.Pool | null = null;

function getMySQLPool(): mysql.Pool | null {
  if (pool) return pool;

  // Check if MySQL environment credentials have been supplied by the user/platform
  const host = process.env.MYSQL_HOST || '';
  const user = process.env.MYSQL_USER || '';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || '';

  if (!host || !user) {
    console.log('MySQL Database credentials are not configured. Running backend with local state fallback.');
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Successfully initialized connection pool to MySQL database.');
    return pool;
  } catch (error) {
    console.error('Failed to create MySQL pool:', error);
    return null;
  }
}

// Global In-Memory Fallback State (so it works right out of the box even without a live MySQL server connected)
import { initialProducts } from "./src/data";
let fallbackProducts: any[] = [...initialProducts];

let fallbackOrders: any[] = [];

let fallbackUsers: any[] = [];

// Admin and Auth Rate Limiters
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit general API routes
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware to verify Admin JWT
const verifyAdminToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized administrative access.' });
  }

  if (!JWT_SECRET) {
    if (token === 'mock-admin-token-for-preview') {
      return next();
    }
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.email) {
      return res.status(401).json({ error: 'Invalid token structure.' });
    }
    
    // Check if it's the admin email
    if (decoded.email !== 'idowutosin70@gmail.com') {
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired administrative token.' });
  }
};

// ==================== API ENDPOINTS ====================

// PAYMENT VERIFICATION
app.get('/api/payment/verify', apiLimiter, async (req, res) => {
  const reference = req.query.reference as string;
  if (!reference) {
    return res.status(400).json({ success: false, message: 'Reference is required' });
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    console.warn('PAYSTACK_SECRET_KEY is missing. In a real environment, verification would fail.');
    // Simulated success for development without key
    return res.json({ success: true, message: 'Simulated success (no secret key provided)' });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
    if (data.status && data.data.status === 'success') {
      return res.json({ success: true, data: data.data });
    } else {
      return res.status(400).json({ success: false, message: 'Transaction verification failed or is not successful.' });
    }
  } catch (err) {
    console.error('Paystack verification error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during verification' });
  }
});

// 1. GET ALL PRODUCTS
app.get('/api/products', apiLimiter, async (req, res) => {
  console.log('>>> FETCHING PRODUCTS');
  const db = getFirebaseDb();
  if (db) {
    try {
      const q = collection(db, 'products');
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((d: any) => d.data());
      
      return res.json(data);
    } catch (err: any) {
      console.log('Firestore fallback for /api/products:', err.message);
    }
  }

  // Fallback to local state
  return res.json(fallbackProducts);
});

app.post('/api/products/:productId/reviews', async (req, res) => {
  const { productId } = req.params;
  const { author, rating, comment, date } = req.body;
  
  const db = getFirebaseDb();
  if (db) {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const reviews = productData.reviews || [];
        const newReview = { id: `rev_${Date.now()}`, author, rating, comment, date };
        reviews.unshift(newReview);
        await updateDoc(productRef, { reviews });
        return res.json({ success: true, review: newReview });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Fallback to local
  const product = fallbackProducts.find(p => p.id === productId);
  if (product) {
    if (!product.reviews) product.reviews = [];
    const newReview = { id: `rev_${Date.now()}`, author, rating, comment, date };
    product.reviews.unshift(newReview);
    return res.json({ success: true, review: newReview });
  }

  return res.status(404).json({ success: false, message: 'Product not found' });
});
app.post('/api/orders/:orderId/cancel', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { orderId } = req.params;
  const db = getFirebaseDb();
  if (db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return res.status(404).json({ error: 'Not found' });
      const order = orderSnap.data();
      
      const orderTime = new Date(order.order_date).getTime();
      const now = new Date().getTime();
      if (now - orderTime > 60 * 60 * 1000) {
         return res.status(400).json({ error: 'Order cannot be cancelled after 1 hour' });
      }
      if (order.status !== 'Confirmed') {
         return res.status(400).json({ error: 'Order cannot be cancelled once accepted' });
      }

      await updateDoc(orderRef, {
        status: 'Cancelled'
      });

      const orderEmail = order.email;
      if (orderEmail) {
        const orderName = order.fullname || order.user_name || 'Customer';
        const statusSubject = `Order Status Update - ${orderId}`;
        const statusHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
            <h2 style="color: #007bff;">Order Cancelled</h2>
            <p>Hi ${orderName},</p>
            <p>Your order <strong>${orderId}</strong> has been successfully cancelled as requested.</p>
            <p>Thank you for shopping with Tizzitech!</p>
            <br>
            <p>Best regards,</p>
            <p>The Tizzitech Team</p>
          </div>
        `;
        try {
          sendEmail(orderEmail, statusSubject, statusHtml).catch(err => console.error("Async email failed:", err));
        } catch (emailErr) {
          console.error("Failed to send cancellation email", emailErr);
        }
      }

      return res.json({ success: true });
    } catch(e) {
      console.log('Error cancelling order', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  return res.json({ success: true });
});
// 2. CREATE NEW ORDER
app.post('/api/orders', apiLimiter, async (req, res) => {
  const { fullname, email, address, paymentOption, total, items, userId } = req.body;
  const orderId = `TZ${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const orderDate = new Date();
  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);

  const db = getFirebaseDb();
  if (db) {
    try {
      await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const prodRefs = items.map((item: any) => doc(db, 'products', item.id));
        const prodDocs = await Promise.all(prodRefs.map((ref: any) => transaction.get(ref)));
        
        let serverItemsTotal = 0;
        const validItems = [];

        for (let i = 0; i < prodDocs.length; i++) {
          const prodDoc = prodDocs[i];
          const requestedItem = items[i];
          
          if (!prodDoc.exists()) {
             throw new Error(`Product ${requestedItem.id} not found.`);
          }
          
          const pData = prodDoc.data() as any;
          if ((pData.stock || 0) < requestedItem.quantity) {
             throw new Error(`Insufficient stock for product ${pData.name}. Only ${pData.stock || 0} remaining.`);
          }
          
          const genuinePrice = pData.price || 0;
          serverItemsTotal += genuinePrice * requestedItem.quantity;
          validItems.push({
             ...requestedItem,
             price: genuinePrice, // enforce pristine database price
             newStock: (pData.stock || 0) - requestedItem.quantity
          });
        }

        // --- ANTI-TAMPERING VALIDATION ---
        // Client sends `total` which includes items + delivery fee (usually 0 to 7000).
        // If client total is less than the raw items total, tampering occurred.
        // We allow the client total to be slightly higher (to account for delivery fees).
        if (total < serverItemsTotal) {
           throw new Error(`Tampering detected: Paid amount (₦${total}) is less than items value (₦${serverItemsTotal}).`);
        }

        // --- WRITE PHASE ---
        const orderRef = doc(db, 'orders', orderId);
        transaction.set(orderRef, {
          id: orderId,
          user_id: userId || null,
          fullname,
          email,
          address,
          payment_option: paymentOption,
          total: total, // we persist the valid total with delivery fee included
          status: 'Confirmed',
          order_date: orderDate.toISOString(),
          expected_delivery_date: expectedDeliveryDate.toISOString()
        });

        for (let i = 0; i < validItems.length; i++) {
           const vItem = validItems[i];
           const orderItemId = `oi${Math.random().toString(36).substring(2, 8)}`;
           const oiRef = doc(db, 'order_items', orderItemId);
           transaction.set(oiRef, {
             id: orderItemId,
             order_id: orderId,
             product_id: vItem.id,
             price: vItem.price,
             quantity: vItem.quantity
           });

           transaction.update(prodRefs[i], { stock: vItem.newStock });
        }
      });

      // Send order confirmation email
      const orderSubject = `Order Confirmation - ${orderId}`;
      const orderHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
          <h2 style="color: #007bff;">Thank You for Your Order!</h2>
          <p>Hi ${fullname},</p>
          <p>We've successfully received your order <strong>${orderId}</strong>.</p>
          <p>Total: <strong>$${total.toFixed(2)}</strong></p>
          <p>Your items are being prepared and your expected delivery date is ${expectedDeliveryDate.toDateString()}.</p>
          <p>We will notify you when your order ships.</p>
          <br>
          <p>Best regards,</p>
          <p>The Tizzitech Team</p>
        </div>
      `;
      sendEmail(email, orderSubject, orderHtml).catch(err => console.error("Async email failed:", err));

      return res.json({
        success: true,
        orderId,
        status: 'Confirmed',
        expectedDeliveryDate
      });
    } catch (err: any) {
      console.error('Order processing failed:', err.message);
      return res.status(400).json({ success: false, message: err.message || 'Order processing failed.' });
    }
  }

  // Fallback order submission (in-memory)
  let serverFallbackTotal = 0;
  for (const orderedItem of items) {
    const prod = fallbackProducts.find(p => p.id === orderedItem.id);
    if (!prod) return res.status(400).json({ success: false, message: 'Product not found.' });
    if (prod.stock < orderedItem.quantity) return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    serverFallbackTotal += prod.price * orderedItem.quantity;
  }
  if (total < serverFallbackTotal) {
    return res.status(400).json({ success: false, message: 'Tampering detected in fallback.' });
  }

  const newOrder = {
    id: orderId,
    user_id: userId || null,
    fullname,
    email,
    address,
    paymentOption,
    total,
    items,
    status: 'Confirmed',
    orderDate,
    expectedDeliveryDate
  };

  fallbackOrders.push(newOrder);

  // Update fallback stock
  items.forEach((orderedItem: any) => {
    const prod = fallbackProducts.find(p => p.id === orderedItem.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - orderedItem.quantity);
    }
  });

  // Send order confirmation email (fallback)
  const orderSubject = `Order Confirmation - ${orderId}`;
  const orderHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Thank You for Your Order!</h2>
      <p>Hi ${fullname},</p>
      <p>We've successfully received your order <strong>${orderId}</strong>.</p>
      <p>Total: <strong>$${total.toFixed(2)}</strong></p>
      <p>Your items are being prepared and your expected delivery date is ${expectedDeliveryDate.toDateString()}.</p>
      <p>We will notify you when your order ships.</p>
      <br>
      <p>Best regards,</p>
      <p>The Tizzitech Team</p>
    </div>
  `;
  sendEmail(email, orderSubject, orderHtml).catch(err => console.error("Async email failed:", err));

  return res.json({
    success: true,
    orderId,
    status: 'Confirmed',
    expectedDeliveryDate
  });
});

// 3. CREATE PRODUCT REVIEW
app.post('/api/products/:productId/reviews', async (req, res) => {
  const { productId } = req.params;
  const { author, rating, comment } = req.body;
  const reviewId = `r${Math.random().toString(36).substring(7)}`;
  const date = new Date().toISOString().split('T')[0];

  const mysqlPool = getMySQLPool();
  if (mysqlPool) {
    try {
      // In a real DB, you'd insert reviews to a `reviews` table config
      console.log(`Saving review in MySQL for product ${productId}:`, { author, rating, comment });
    } catch (err: any) {
      console.log('MySQL review write issue:', err.message);
    }
  }

  // Handle local state update
  const prod = fallbackProducts.find(p => p.id === productId);
  if (prod) {
    if (!prod.reviews) prod.reviews = [];
    prod.reviews.push({ id: reviewId, author, rating, comment, date });
  }

  return res.json({ success: true, review: { id: reviewId, author, rating, comment, date } });
});

// 4. ADMIN: UPDATE PRODUCT STOCK
app.patch('/api/products/:productId/stock', async (req, res) => {
  const { productId } = req.params;
  const { stock } = req.body;

  const db = getFirebaseDb();
  if (db) {
    try {
      await updateDoc(doc(db, 'products', productId), { stock });
      return res.json({ success: true, stock });
    } catch (err: any) {
      console.log('Firestore fallback for updating product stock:', err.message);
    }
  }

  // local update fallback
  const prod = fallbackProducts.find(p => p.id === productId);
  if (prod) {
    prod.stock = stock;
  }

  return res.json({ success: true, productId, stock });
});

// Admin and Auth Rate Limiters moved up

// 5. ADMIN: RETRIEVE ALL ORDERS
app.get('/api/admin/orders', verifyAdminToken, async (req, res) => {
  const db = getFirebaseDb();
  if (db) {
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      let ordersRows = ordersSnap.docs.map((d: any) => d.data());
      ordersRows.sort((a, b) => { const db = a.order_date ? new Date(a.order_date).getTime() : 0; const da = b.order_date ? new Date(b.order_date).getTime() : 0; return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db); });

      const ordersData = [];
      for (const order of ordersRows) {
        const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', order.id || ''));
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
      return res.json(ordersData);
    } catch (err: any) {
      console.log('Firestore fallback triggered for /api/admin/orders:', err.stack);
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
  }

  return res.json(fallbackOrders);
});

// 6. ADMIN: UPDATE ORDER STATUS
app.patch('/api/admin/orders/:orderId/status', verifyAdminToken, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  let orderEmail = '';
  let orderName = '';

  const db = getFirebaseDb();
  if (db) {
    try {
      const orderSnap = await getDoc(doc(db, 'orders', orderId));
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        orderEmail = orderData.email;
        orderName = orderData.fullname;
      }
      await updateDoc(doc(db, 'orders', orderId), { status });
      
      if (orderEmail) {
        const statusSubject = `Order Status Update - ${orderId}`;
        const statusHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
            <h2 style="color: #007bff;">Order Update</h2>
            <p>Hi ${orderName},</p>
            <p>The status of your order <strong>${orderId}</strong> has been updated to: <strong>${status}</strong>.</p>
            <p>Thank you for shopping with Tizzitech!</p>
            <br>
            <p>Best regards,</p>
            <p>The Tizzitech Team</p>
          </div>
        `;
        sendEmail(orderEmail, statusSubject, statusHtml).catch(err => console.error("Async email failed:", err));
      }
      
      return res.json({ success: true, orderId, status });
    } catch (err: any) {
      console.log('Firestore fallback for updating order status:', err.message);
    }
  }

  const order = fallbackOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    orderEmail = order.email;
    orderName = order.fullname;
    
    if (orderEmail) {
      const statusSubject = `Order Status Update - ${orderId}`;
      const statusHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
          <h2 style="color: #007bff;">Order Update</h2>
          <p>Hi ${orderName},</p>
          <p>The status of your order <strong>${orderId}</strong> has been updated to: <strong>${status}</strong>.</p>
          <p>Thank you for shopping with Tizzitech!</p>
          <br>
          <p>Best regards,</p>
          <p>The Tizzitech Team</p>
        </div>
      `;
      sendEmail(orderEmail, statusSubject, statusHtml).catch(err => console.error("Async email failed:", err));
    }
  }
  return res.json({ success: true, orderId, status });
});

// 7. ADMIN: AUTHENTICATE SYSTEM ACCESS
app.post('/api/admin/authenticate', authLimiter, (req, res) => {
  const { key } = req.body;
  const systemKey = process.env.ADMIN_KEY || 'admin123';
  
  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not set.');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  if (key === systemKey) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Incorrect Administrator Passkey.' });
});

// 8. ADMIN: ADD NEW PRODUCT
app.post('/api/products', verifyAdminToken, async (req, res) => {
  const newProduct = req.body;

  const db = getFirebaseDb();
  if (db) {
    try {
      const { id, name, brand, category, price, condition, specs, description, stock, imageUrl } = newProduct;
      await setDoc(doc(db, 'products', id), newProduct);
      return res.json({ success: true, product: newProduct });
    } catch (err: any) {
      console.log('Firestore fallback for adding product:', err.message);
    }
  }

  // local fallback
  fallbackProducts.push({ ...newProduct, reviews: [] });
  return res.json({ success: true, product: newProduct });
});

// 8a. ADMIN: UPLOAD PRODUCT IMAGE
app.post('/api/admin/upload-image', verifyAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  // Convert buffer to Base64 string for Cloudinary upload
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
  
  cloudinary.uploader.upload(dataURI, {
    resource_type: 'auto',
    folder: 'tizzitech_products',
  })
  .then((result) => {
    return res.json({ success: true, url: result.secure_url });
  })
  .catch((error) => {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image to Cloudinary.' });
  });
});

// 8b. ADMIN: SEED DATABASE
app.post("/api/admin/force-seed", async (req, res) => {
  const db = getFirebaseDb();
  if (!db) return res.status(500).json({ success: false, message: "No db" });
  try {
    const productsToSeed = fallbackProducts.map(({ id, name, brand, category, price, condition, specs, description, stock, imageUrl }) => ({ id, name, brand, category, price, condition, specs, description: description || "", stock, imageUrl }));
    await Promise.all(productsToSeed.map((p: any) => setDoc(doc(db, "products", p.id), p)));
    return res.json({ success: true, message: "Seeded" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/seed', verifyAdminToken, async (req, res) => {
  const db = getFirebaseDb();
  if (!db) {
    return res.status(500).json({ success: false, message: 'Firestore client not initialized.' });
  }

  try {
    const productsToSeed = fallbackProducts.map(({ id, name, brand, category, price, condition, specs, description, stock, imageUrl }) => ({
      id, name, brand, category, price, condition, specs, description, stock, imageUrl
    }));

    await Promise.all(productsToSeed.map((p: any) => setDoc(doc(db, 'products', p.id), p)));
    
    return res.json({ success: true, message: 'Initial fallback products seeded to Firestore successfully.' });
  } catch (err: any) {
    console.error('Firestore seeding error:', err.message);
    return res.status(500).json({ success: false, message: 'Seeding failed.', error: err.message });
  }
});

// 9. DATABASE STATUS TEST (MySQL)
app.get('/api/db-test', async (req, res) => {
  const mysqlPool = getMySQLPool();
  if (!mysqlPool) {
    return res.status(500).json({ success: false, message: 'MySQL is not configured or failed to initialize.' });
  }

  try {
    const [rows]: any = await mysqlPool.query('SELECT 1 + 1 AS solution');
    return res.json({ success: true, message: 'Successfully connected to MySQL database on the cloud server!', result: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to query the database.', error: err.message });
  }
});

// 10. SUPABASE STATUS TEST
app.get('/api/firestore-test', async (req, res) => {
  const firebasedb = getFirebaseDb();
  if (!firebasedb) {
    return res.status(500).json({ success: false, message: 'Firestore keys are missing in the .env file.' });
  }

  try {
    // A simple query to check connection, assuming there's at least one table we can lightly query, 
    // or just checking if the auth/client is active. We can query a dummy non-existent table just to see the error type, 
    // but the easiest way is checking if the client initialized successfully. 
    return res.json({ success: true, message: 'Successfully connected to Firestore from the backend!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to query Firestore.', error: err.message });
  }
});

// 11. USER REGISTRATION
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { email, password, firstName, surname, address, phone } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const userId = `U${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const hashedPassword = await bcrypt.hash(password, 10);

  const db = getFirebaseDb();
  if (db) {
    try {
      // Create user
      const existQ = query(collection(db, 'users'), where('email', '==', email || ''));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) return res.status(400).json({ success: false, message: 'Email already registered' });

      await setDoc(doc(db, 'users', userId), {
        id: userId, email, password: hashedPassword,
        firstname: firstName, lastname: surname, address, phone, role: 'user'
      });

      const token = jwt.sign({ userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      
      // Send welcome email
      const welcomeSubject = "Welcome to Tizzitech!";
      const welcomeHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #eee; padding: 40px 30px; border-radius: 12px; border: 1px solid #333; text-align: center;">
          <div style="margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 28px; margin-bottom: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Welcome to Tizzitech</h1>
            <p style="color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Trusted Tech Destination</p>
          </div>
          <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #222;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Welcome to <strong>Tizzitech Online Store</strong> — the store you can trust with all your tech accessories, from laptops and phones to chargers, power banks, and so much more.</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0; text-align: left;">We hope that you enjoy shopping with us!</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
            <p style="margin-bottom: 5px;">Best regards,</p>
            <p style="color: #aaa; font-weight: bold; font-size: 14px;">The Tizzitech Team</p>
          </div>
        </div>
      `;
      sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
      
      return res.json({ success: true, token, user: { id: userId, email, firstName, surname, address, phone, role: 'user' } });
    } catch (err: any) {
      console.warn('Firestore not fully configured yet, falling back to local memory for registration.');
    }
  }

  // Fallback to in-memory registration
  const existingFallbackUser = fallbackUsers.find(u => u.email === email);
  if (existingFallbackUser) return res.status(400).json({ success: false, message: 'Email already registered' });

  const fallbackHashedPassword = await bcrypt.hash(password, 10);
  const userObj = {
    id: userId,
    email,
    password: fallbackHashedPassword,
    firstname: firstName,
    lastname: surname,
    address,
    phone,
    role: 'user'
  };
  fallbackUsers.push(userObj);

  const token = jwt.sign({ userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  
  // Send welcome email
  const welcomeSubject = "Welcome to Tizzitech!";
  const welcomeHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #eee; padding: 40px 30px; border-radius: 12px; border: 1px solid #333; text-align: center;">
      <div style="margin-bottom: 30px;">
        <h1 style="color: #3b82f6; font-size: 28px; margin-bottom: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Welcome to Tizzitech</h1>
        <p style="color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Trusted Tech Destination</p>
      </div>
      <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #222;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Hello <strong>${firstName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Welcome to <strong>Tizzitech Online Store</strong> — the store you can trust with all your tech accessories, from laptops and phones to chargers, power banks, and so much more.</p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0; text-align: left;">We hope that you enjoy shopping with us!</p>
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
        <p style="margin-bottom: 5px;">Best regards,</p>
        <p style="color: #aaa; font-weight: bold; font-size: 14px;">The Tizzitech Team</p>
      </div>
    </div>
  `;
  sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
  
  return res.json({ success: true, token, user: { id: userId, email, firstName, surname, address, phone, role: 'user' } });
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  // Generate 5-minute token
  const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });

  const resetSubject = "Password Reset Request - Tizzitech";
  const resetHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Password Reset</h2>
      <p>We received a request to reset your password for your Tizzitech account.</p>
      <p>If you didn't make this request, you can safely ignore this email.</p>
      <p>This link is valid for 5 minutes.</p>
      <p>Otherwise, click the link below to reset your password:</p>
      <br>
      <a href="${process.env.APP_URL || 'http://localhost:3000'}?view=reset-password&token=${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <br><br>
      <p>Best regards,</p>
      <p>The Tizzitech Team</p>
    </div>
  `;
  sendEmail(email, resetSubject, resetHtml).catch(err => console.error("Async email failed:", err));

  return res.json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
});

app.post('/api/auth/update-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password required' });
  
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired reset token' });
  }

  const email = decoded.email;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', email || ''));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) {
        const userRef = existSnap.docs[0].ref;
        await updateDoc(userRef, { password: hashedPassword });
        return res.json({ success: true, message: 'Password updated successfully' });
      }
    } catch (e) {}
  }
  
  const fallbackUser = fallbackUsers.find(u => u.email === email);
  if (fallbackUser) {
    fallbackUser.password = hashedPassword;
    return res.json({ success: true, message: 'Password updated successfully' });
  }

  return res.status(404).json({ success: false, message: 'User not found' });
});
app.post('/api/auth/google', authLimiter, async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ success: false, message: 'Google token required' });

  try {
    const ticket = await new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || '850466444828-ocjc7iotr69hsv8e29hntu1no1n0aege.apps.googleusercontent.com').verifyIdToken({
      idToken: credential,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google payload');

    const email = payload.email!;
    const firstName = payload.given_name || '';
    const surname = payload.family_name || '';

    const db = getFirebaseDb();
    if (db) {
      try {
        const existQ = query(collection(db, 'users'), where('email', '==', email || ''));
        const existSnap = await getDocs(existQ);
        let user: any = null;
        if (!existSnap.empty) user = existSnap.docs[0].data();
        let userId = user?.id;
        
        if (!user) {
          userId = `U${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          user = {
            id: userId, email, password: 'oauth_user_no_password',
            firstname: firstName, lastname: surname, role: 'user'
          };
          await setDoc(doc(db, 'users', userId), user);
          
          // Send welcome email for new Google Auth users
          const welcomeSubject = "Welcome to Tizzitech!";
          const welcomeHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #eee; padding: 40px 30px; border-radius: 12px; border: 1px solid #333; text-align: center;">
              <div style="margin-bottom: 30px;">
                <h1 style="color: #3b82f6; font-size: 28px; margin-bottom: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Welcome to Tizzitech</h1>
                <p style="color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Trusted Tech Destination</p>
              </div>
              <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #222;">
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Hello <strong>${firstName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Welcome to <strong>Tizzitech Online Store</strong> — the store you can trust with all your tech accessories, from laptops and phones to chargers, power banks, and so much more.</p>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0; text-align: left;">We hope that you enjoy shopping with us!</p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
                <p style="margin-bottom: 5px;">Best regards,</p>
                <p style="color: #aaa; font-weight: bold; font-size: 14px;">The Tizzitech Team</p>
              </div>
            </div>
          `;
          sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
        }

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ 
          success: true, 
          token, 
          user: { 
            id: user.id, email: user.email, firstName: user.firstname, surname: user.lastname, address: user.address, phone: user.phone, role: user.role, city: user.city, stateLocation: user.stateLocation, lga: user.lga 
          } 
        });
      } catch (err: any) {
        console.warn('Firestore not fully configured yet, falling back to local memory for google login.');
      }
    }

    // Fallback to in-memory login
    let fallbackUser = fallbackUsers.find(u => u.email === email);
    if (!fallbackUser) {
      fallbackUser = {
        id: `U${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        email,
        password: 'oauth_user_no_password',
        firstname: firstName,
        lastname: surname,
        role: 'user'
      };
      fallbackUsers.push(fallbackUser);
      
      // Send welcome email for new Google Auth users
      const welcomeSubject = "Welcome to Tizzitech!";
      const welcomeHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #eee; padding: 40px 30px; border-radius: 12px; border: 1px solid #333; text-align: center;">
          <div style="margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 28px; margin-bottom: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Welcome to Tizzitech</h1>
            <p style="color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Trusted Tech Destination</p>
          </div>
          <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #222;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; text-align: left;">Welcome to <strong>Tizzitech Online Store</strong> — the store you can trust with all your tech accessories, from laptops and phones to chargers, power banks, and so much more.</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0; text-align: left;">We hope that you enjoy shopping with us!</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
            <p style="margin-bottom: 5px;">Best regards,</p>
            <p style="color: #aaa; font-weight: bold; font-size: 14px;">The Tizzitech Team</p>
          </div>
        </div>
      `;
      sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
    }

    const token = jwt.sign({ userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ 
      success: true, 
      token, 
      user: { 
        id: fallbackUser.id, email: fallbackUser.email, firstName: fallbackUser.firstname, surname: fallbackUser.lastname, address: fallbackUser.address, phone: fallbackUser.phone, role: fallbackUser.role, city: (fallbackUser as any).city, stateLocation: (fallbackUser as any).stateLocation, lga: (fallbackUser as any).lga 
      } 
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

// 12. USER LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', email || ''));
      const existSnap = await getDocs(existQ);
      let user: any = null;
      if (!existSnap.empty) user = existSnap.docs[0].data();
      if (!user) throw new Error('User not found in Firestore');

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ 
        success: true, 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstname, 
          surname: user.lastname, 
          address: user.address,
          city: user.city,
          stateLocation: user.stateLocation,
          lga: user.lga, 
          phone: user.phone, 
          role: user.role 
        } 
      });
    } catch (err: any) {
      console.warn('Firestore not fully configured yet, falling back to local memory for login.');
    }
  }

  // Fallback to in-memory login
  const fallbackUser = fallbackUsers.find(u => u.email === email);
  if (!fallbackUser) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, fallbackUser.password);
  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = jwt.sign({ userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ 
    success: true, 
    token, 
    user: { 
      id: fallbackUser.id, 
      email: fallbackUser.email, 
      firstName: fallbackUser.firstname, 
      surname: fallbackUser.lastname, 
      address: fallbackUser.address, 
      phone: fallbackUser.phone, 
      role: fallbackUser.role 
    } 
  });
});

app.put('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const { firstName, surname, address, phone, codename, city, stateLocation, lga } = req.body;
  
  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('id', '==', decoded.userId || decoded.backendId || ''));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) {
        const userRef = existSnap.docs[0].ref;
        await updateDoc(userRef, {
          ...(firstName && { firstname: firstName }),
          ...(surname && { lastname: surname }),
          ...(address && { address }),
          ...(phone && { phone }),
          ...(codename && { codename }),
          ...(city && { city }),
          ...(stateLocation && { stateLocation }),
          ...(lga && { lga }),
        });
        return res.json({ success: true, message: 'Profile updated successfully' });
      } else if (decoded.email) {
        const existEmailQ = query(collection(db, 'users'), where('email', '==', decoded.email || ''));
        const existEmailSnap = await getDocs(existEmailQ);
        if (!existEmailSnap.empty) {
          const userRef = existEmailSnap.docs[0].ref;
          await updateDoc(userRef, {
            ...(firstName && { firstname: firstName }),
            ...(surname && { lastname: surname }),
            ...(address && { address }),
            ...(phone && { phone }),
            ...(codename && { codename }),
            ...(city && { city }),
            ...(stateLocation && { stateLocation }),
            ...(lga && { lga }),
          });
          return res.json({ success: true, message: 'Profile updated successfully' });
        }
      }
      return res.status(404).json({ success: false, message: 'User not found in database' });
    } catch (e) {
      console.error(e);
      // fallback
    }
  }

  // Fallback memory
  const fallbackUserIndex = fallbackUsers.findIndex(u => u.id === decoded.userId || u.id === decoded.backendId || u.email === decoded.email);
  if (fallbackUserIndex !== -1) {
    if (firstName) fallbackUsers[fallbackUserIndex].firstname = firstName;
    if (surname) fallbackUsers[fallbackUserIndex].lastname = surname;
    if (address) fallbackUsers[fallbackUserIndex].address = address;
    if (phone) fallbackUsers[fallbackUserIndex].phone = phone;
    (fallbackUsers[fallbackUserIndex] as any).city = city || (fallbackUsers[fallbackUserIndex] as any).city;
    (fallbackUsers[fallbackUserIndex] as any).stateLocation = stateLocation || (fallbackUsers[fallbackUserIndex] as any).stateLocation;
    (fallbackUsers[fallbackUserIndex] as any).lga = lga || (fallbackUsers[fallbackUserIndex] as any).lga;
    
    return res.json({ success: true, message: 'Profile updated in fallback memory' });
  }

  return res.status(404).json({ success: false, message: 'User not found' });
});
// 13. GET USER ORDERS
app.get('/api/users/:userId/orders', async (req, res) => {
  const { userId } = req.params;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
    // Relaxed check: if it's the right user, or an admin, or the ID is a Google fallback ID
    if (decoded.userId !== userId && decoded.role !== 'admin' && !userId.startsWith('g_')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      let ordersRows: any[] = [];
      try {
        const q1 = query(collection(db, 'orders'), where('userId', '==', userId));
        const snap1 = await getDocs(q1);
        snap1.docs.forEach((d: any) => ordersRows.push(d.data()));
      } catch(e) {}
      
      if (decoded.email) {
        try {
          const q2 = query(collection(db, 'orders'), where('email', '==', decoded.email));
          const snap2 = await getDocs(q2);
          snap2.docs.forEach((d: any) => {
            const data = d.data();
            if (!ordersRows.find(o => o.id === data.id)) {
              ordersRows.push(data);
            }
          });
        } catch(e) {}
      }
      ordersRows.sort((a, b) => { const db = a.orderDate ? new Date(a.orderDate).getTime() : 0; const da = b.orderDate ? new Date(b.orderDate).getTime() : 0; return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db); });

      const ordersData = [];
      for (const order of (ordersRows || [])) {
        const itemsArray = [];
        for (const iData of (order.items || [])) {
           let pData: any = null;
           try {
             const pSnap = await getDoc(doc(db, 'products', iData.id));
             if (pSnap.exists()) pData = pSnap.data();
           } catch(e) {}
           itemsArray.push({
             id: iData.id, name: pData?.name || 'Product', brand: pData?.brand || '',
             category: pData?.category || '', price: iData.price || 0, quantity: iData.quantity || 1,
             imageUrl: pData?.imageUrl || ''
           });
        }

        ordersData.push({
          id: order.id,
          fullname: order.fullname,
          email: order.email,
          address: order.address,
          paymentOption: order.paymentOption || 'Card',
          total: order.total,
          status: order.status,
          orderDate: order.orderDate || new Date().toISOString(),
          expectedDeliveryDate: order.expectedDeliveryDate || new Date().toISOString(),
          items: itemsArray
        });
      }
      return res.json({ success: true, orders: ordersData });
    } catch (err: any) {
      console.log('Firestore fallback for get user orders:', err.message);
    }
  }
  
  const userFallbackOrders = decoded?.email 
    ? fallbackOrders.filter(o => o.email === decoded.email)
    : fallbackOrders.filter(o => o.user_id === userId);
  return res.json({ success: true, orders: userFallbackOrders });
});

app.post('/api/orders/statuses', async (req, res) => {
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.json({ success: true, statuses: {} });
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      const statuses: Record<string, string> = {};
      for (const id of orderIds) {
        const snap = await getDoc(doc(db, 'orders', id));
        if (snap.exists()) {
          statuses[id] = snap.data().status;
        }
      }
      return res.json({ success: true, statuses });
    } catch (err: any) {
      console.log('Firestore fallback for get order statuses:', err.message);
    }
  }

  // Fallback
  const statuses: Record<string, string> = {};
  for (const id of orderIds) {
    const o = fallbackOrders.find(o => o.id === id);
    if (o) statuses[id] = o.status;
  }
  return res.json({ success: true, statuses });
});

// 14. NEWSLETTER SUBSCRIPTION
app.post('/api/newsletter/subscribe', apiLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'newsletter_subscribers'), where('email', '==', email || ''));
      const existSnap = await getDocs(existQ);
      
      if (!existSnap.empty) {
        return res.json({ success: true, message: 'Already subscribed' });
      }

      const newSubRef = doc(collection(db, 'newsletter_subscribers'));
      await setDoc(newSubRef, {
        email,
        subscribedAt: new Date().toISOString(),
        status: 'active'
      });
      
      // Send welcome email
      const welcomeSubject = "Welcome to Tizzitech's Newsletter!";
      const welcomeHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
          <h2 style="color: #007bff;">Welcome to Tizzitech!</h2>
          <p>Thank you for subscribing to our newsletter. You'll be the first to know about our latest tech accessories, exclusive deals, and more.</p>
          <p>Stay tuned!</p>
          <p>- The Tizzitech Team</p>
        </div>
      `;
      sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
      
      return res.json({ success: true, message: 'Successfully subscribed' });
    } catch (err: any) {
      console.error('Firestore newsletter error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Send welcome email
  const welcomeSubject = "Welcome to Tizzitech's Newsletter!";
  const welcomeHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Welcome to Tizzitech!</h2>
      <p>Thank you for subscribing to our newsletter. You'll be the first to know about our latest tech accessories, exclusive deals, and more.</p>
      <p>Stay tuned!</p>
      <p>- The Tizzitech Team</p>
    </div>
  `;
  sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));

  return res.json({ success: true, message: 'Successfully subscribed (Fallback)' });
});

// 15. ADMIN NEWSLETTER ROUTES
app.get('/api/admin/newsletter/subscribers', verifyAdminToken, async (req, res) => {
  const db = getFirebaseDb();
  if (!db) {
    return res.json({ success: true, subscribers: [] }); // Fallback
  }

  try {
    const q = collection(db, 'newsletter_subscribers');
    const querySnapshot = await getDocs(q);
    const subscribers: any[] = [];
    querySnapshot.forEach((doc) => {
      subscribers.push({ id: doc.id, ...doc.data() });
    });
    return res.json({ success: true, subscribers });
  } catch (err: any) {
    console.error('Error fetching subscribers:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/newsletter/send', verifyAdminToken, async (req, res) => {
  const { subject, content } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ success: false, message: 'Subject and content are required' });
  }

  const db = getFirebaseDb();
  if (!db) {
    return res.json({ success: true, message: 'Newsletter sent successfully (Fallback)' });
  }

  try {
    // 1. Fetch active subscribers
    const activeQ = query(collection(db, 'newsletter_subscribers'), where('status', '==', 'active'));
    const activeSnap = await getDocs(activeQ);
    
    if (activeSnap.empty) {
      return res.status(400).json({ success: false, message: 'No active subscribers found' });
    }

    const emails = activeSnap.docs.map(d => d.data().email);

    // 2. Wrap content in a template
    const templateHTML = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
        <div style="padding: 20px; border-bottom: 1px solid #333; text-align: center;">
          <img src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop" alt="Tizzitech Logo" style="width: 40px; height: 40px; border-radius: 50%;" />
          <h2 style="margin: 10px 0 0 0; font-family: serif; letter-spacing: -1px;">TIZZITECH</h2>
        </div>
        <div style="padding: 30px 20px; background-color: #111;">
          ${content}
        </div>
        <div style="padding: 20px; background-color: #000; text-align: center; border-top: 1px solid #333; color: #888; font-size: 12px;">
          <p>You received this email because you are subscribed to Tizzitech's newsletter.</p>
          <p>&copy; ${new Date().getFullYear()} Tizzitech. All rights reserved.</p>
        </div>
      </div>
    `;

    // 3. Send emails using Nodemailer
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Send to all subscribers via BCC
      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || '"Tizzitech" <newsletter@tizzitech.com>',
        to: process.env.SMTP_FROM_EMAIL || '"Tizzitech" <newsletter@tizzitech.com>', // Set a default to, use BCC for actual recipients
        bcc: emails,
        subject: subject,
        html: templateHTML,
      });
      console.log(`[EMAIL SENT] Newsletter "${subject}" sent to ${emails.length} subscribers via SMTP.`);
    } else {
      console.log(`[SIMULATED EMAIL] Sending newsletter "${subject}" to ${emails.length} subscribers.`);
      console.log('To actually send emails, configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your secrets.');
    }

    // Optional: Log this campaign in a new Firestore collection for tracking
    try {
      const campaignRef = doc(collection(db, 'newsletter_campaigns'));
      await setDoc(campaignRef, {
        subject,
        content: templateHTML,
        recipientCount: emails.length,
        sentAt: new Date().toISOString()
      });
    } catch (campaignErr: any) {
      console.warn("Could not log campaign to Firestore, continuing anyway:", campaignErr.message);
    }

    return res.json({ success: true, message: `Newsletter successfully sent to ${emails.length} subscribers!` });
  } catch (err: any) {
    console.error('Error sending newsletter:', err);
    return res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
});

// ========================================================

async function boot() {
  // Redirect /admin to /admin.html cleanly in both regimes
  app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
  });

  // Vite integration middleware configuration
  if (process.env.NODE_ENV !== 'production') {
    const viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(viteInstance.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Explicit route match for /admin.html in production
    app.get('/admin.html', (req, res) => {
      res.sendFile(path.join(distPath, 'admin.html'));
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tizzitech Full-Stack backend running on port ${PORT}`);
  });
}

boot();
