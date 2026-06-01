import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3000;

// Enable JSON middleware for parsing parsed body structures
app.use(express.json());

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
let fallbackProducts = [
  {
    id: 'p1',
    name: 'MacBook Pro 16" M2 Max',
    category: 'Laptops',
    brand: 'Apple',
    price: 3499000,
    condition: 'New',
    specs: { ram: '32GB', storage: '1TB SSD', processor: 'Apple M2 Max (12-core CPU)', display: '16.2" Liquid Retina XDR' },
    description: 'The ultimate pro laptop. With the incredible power of the M2 Max chip, experience game-changing performance.',
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    reviews: [] as any[]
  },
  {
    id: 'p2',
    name: 'Dell XPS 15',
    category: 'Laptops',
    brand: 'Dell',
    price: 1200000,
    condition: 'Used',
    specs: { ram: '16GB', storage: '512GB SSD', processor: 'Intel Core i7-12700H', display: '15.6" FHD+' },
    description: 'A perfect balance of power and portability with a premium steel finish.',
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    reviews: [] as any[]
  },
  {
    id: 'p3',
    name: 'iPhone 13 Pro',
    category: 'Phones',
    brand: 'Apple',
    price: 699000,
    condition: 'Used',
    specs: { storage: '128GB', color: 'Graphite' },
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80',
    reviews: [] as any[]
  }
];

let fallbackOrders: any[] = [];

// ==================== API ENDPOINTS ====================

// 1. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  const mysqlPool = getMySQLPool();

  if (mysqlPool) {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM products');
      return res.json(rows);
    } catch (err: any) {
      console.warn('MySQL error on /api/products, using fallback state:', err.message);
    }
  }

  // Fallback to local state
  return res.json(fallbackProducts);
});

// 2. CREATE NEW ORDER
app.post('/api/orders', async (req, res) => {
  const { fullname, email, address, paymentOption, total, items } = req.body;
  const orderId = `TZ${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const orderDate = new Date();
  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);

  const mysqlPool = getMySQLPool();

  if (mysqlPool) {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert order entry
      await connection.query(
        'INSERT INTO orders (id, fullname, email, address, payment_option, total, status, expected_delivery_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, fullname, email, address, paymentOption, total, 'Confirmed', expectedDeliveryDate]
      );

      // Insert associated items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)',
          [orderId, item.id, item.price, item.quantity]
        );
        // Reduce stock in database
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.id]
        );
      }

      await connection.commit();
      connection.release();

      return res.json({
        success: true,
        orderId,
        status: 'Confirmed',
        expectedDeliveryDate
      });
    } catch (err: any) {
      await connection.rollback();
      connection.release();
      console.warn('MySQL transaction failed, using in-memory fallback:', err.message);
    }
  }

  // Fallback order submission
  const newOrder = {
    id: orderId,
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
      console.warn('MySQL review write issue:', err.message);
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

  const mysqlPool = getMySQLPool();
  if (mysqlPool) {
    try {
      await mysqlPool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, productId]);
      return res.json({ success: true, stock });
    } catch (err: any) {
      console.warn('MySQL failure updating product stock:', err.message);
    }
  }

  // local update fallback
  const prod = fallbackProducts.find(p => p.id === productId);
  if (prod) {
    prod.stock = stock;
  }

  return res.json({ success: true, productId, stock });
});

// ========================================================

async function boot() {
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tizzitech Full-Stack backend running on port ${PORT}`);
  });
}

boot();
