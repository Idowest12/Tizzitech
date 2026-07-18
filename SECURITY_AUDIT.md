# Security Audit & Risk Mitigation Plan: Tizzitech Storefront
*A review of cryptographic bypasses, database exposure, data leaks, and access control vulnerabilities for production deployments.*

---

## Executive Summary
Rapid development patterns ("vibe coding") frequently overlook critical backend verification rules and access control structures. In a production environment with active users, these oversights expose application databases, customer identities, and admin functions to complete compromise.

An audit of the **Tizzitech** storefront codebase reveals **6 critical security vulnerabilities**:
1. **Cryptographic Admin Authentication Bypass**: The backend decodes administrator JWTs without verifying their cryptographic signatures, allowing anyone to forge an admin token.
2. **Wide-Open Database Security Rules**: Firestore security rules are configured to permit public read/write access to all collections from anywhere on the internet.
3. **Insecure Direct Object Reference (IDOR)**: The user order-retrieval route contains relaxed validation checks that allow reading sensitive orders of Google-authenticated accounts without correct validation.
4. **Completely Unprotected Public Seed Endpoint**: The `/api/admin/force-seed` endpoint is fully public and can be invoked anonymously to overwrite the entire products catalogue.
5. **Hardcoded Cryptographic Fallback Secrets**: Important cryptographic variables like `JWT_SECRET` and `ADMIN_KEY` default to insecure static text strings if environment variables are not set.
6. **No Client-Side API Key Hiding for Sensitive Gateways**: OAuth credentials and external parameters are hardcoded directly into the client bundle rather than resolved server-side.

---

## Detailed Vulnerability Analysis

### 1. Cryptographic Admin Token Signature Bypass (Critical)
* **Location**: `/server.ts` (inside the `verifyAdminToken` middleware)
* **Code pattern**:
  ```typescript
  try {
    const decoded = jwt.decode(token) as any; // ⚠️ FAILURE TO VERIFY SIGNATURE
    if (!decoded || !decoded.email) { ... }
    if (decoded.email !== 'idowutosin70@gmail.com') { ... }
  ```
* **The Exploit**: `jwt.decode` only base64-decodes the payload of a JSON Web Token so that it is readable; it does **not** check whether the token was signed with the server's private key (`JWT_SECRET`). 
* **The Danger**: An attacker can go to a tool like [jwt.io](https://jwt.io), create a fake token payload with the email `'idowutosin70@gmail.com'`, sign it with nothing, send it to your API, and your server will gladly grant them complete administrator access. They can delete products, access user accounts, view purchase history, and modify site settings.

---

## 2. Wide-Open Cloud Security Rules (Critical)
* **Location**: `/firestore.rules`
* **Code pattern**:
  ```javascript
  match /{document=**} {
    allow read, write: if true; // ⚠️ UNRESTRICTED INTERNET ACCESS
  }
  ```
* **The Exploit**: Firebase databases are exposed directly to the public internet via the client SDK. This ruleset allows any anonymous client on the web to make read, write, update, and delete calls directly to your Firestore database.
* **The Danger**: A simple script using your public Firebase configuration can crawl, steal, download, or delete your entire database (users, orders, settings, products) in under 5 seconds. This results in devastating data loss, privacy regulations violations (GDPR/NDPR), and catastrophic financial losses.

---

## 3. Insecure Direct Object Reference (IDOR) on Orders (High)
* **Location**: `/server.ts` (inside `GET /api/users/:userId/orders`)
* **Code pattern**:
  ```typescript
  if (decoded.userId !== userId && decoded.role !== 'admin' && !userId.startsWith('g_')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  ```
* **The Exploit**: The authorization validation checks if the request token owner matches the target `userId`. However, there is a relaxed bypass: if the target `userId` starts with `"g_"`, the validation check is completely ignored.
* **The Danger**: Since Google-authenticated user accounts are saved with `"g_"` prefixes, an attacker can simply harvest or iterate through user IDs starting with `"g_"` and download their exact addresses, billing details, phone numbers, and orders without any authentication.

---

## 4. Fully Exposed Administrative Database Seed Endpoint (High)
* **Location**: `/server.ts` (inside `POST /api/admin/force-seed`)
* **Code pattern**:
  ```typescript
  app.post("/api/admin/force-seed", async (req, res) => { // ⚠️ NO MIDDLEWARE
    const db = getFirebaseDb();
    if (!db) return res.status(500).json({ success: false, message: "No db" });
    try {
      const productsToSeed = fallbackProducts.map(...);
      await Promise.all(productsToSeed.map((p: any) => setDoc(doc(db, "products", p.id), p)));
      ...
  ```
* **The Exploit**: The `/api/admin/force-seed` endpoint bypasses the `verifyAdminToken` middleware entirely. It is a completely open public route.
* **The Danger**: Any internet user or bot scanning your storefront's endpoints can trigger a POST request to `/api/admin/force-seed` to overwrite active products with placeholder datasets, causing instant downtime, catalog disruption, and store defacement.

---

## 5. Insecure Fallback Cryptographic Secrets (Medium)
* **Location**: `/server.ts` (lines 56 and 1192)
* **Code pattern**:
  ```typescript
  const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRETS || 'tizzitech-super-secret-key';
  const systemKey = process.env.ADMIN_KEY || 'admin123';
  ```
* **The Exploit**: If the host environment does not declare the `JWT_SECRET` or `ADMIN_KEY` environment variables, the system automatically falls back to hardcoded strings ('tizzitech-super-secret-key' and 'admin123').
* **The Danger**: Attackers frequently check open-source repositories or decompiled code for default credentials. If your server is launched without these variables configured, attackers can use the default password `'admin123'` to obtain admin credentials and generate fully valid JWTs using the known key.

---

## Priority Mitigation Plan (Step-by-Step)

### Step 1: Secure Admin Token Verification
Replace the unsafe decode check with real verification:
```typescript
// SECURE VERSION
try {
  // Use jwt.verify to cryptographically check signature integrity with secret
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  
  if (decoded.role !== 'admin' && decoded.email !== 'idowutosin70@gmail.com') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  ...
} catch (err) {
  return res.status(401).json({ error: 'Invalid or expired administrative token.' });
}
```

### Step 2: Establish Secure Firestore Rules
Restrict Firestore to authorize reads and writes based on user context rather than global access.
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Products are public read, but write is strictly admin-only
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // must go through secure backend APIs only
    }
    // 2. Settings are public read, admin-only write
    match /settings/{settingId} {
      allow read: if true;
      allow write: if false;
    }
    // 3. User profiles and orders are strictly user-specific or backend-only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // orders should be handled securely on the server
    }
    // Default fallback: reject all other requests by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Secure IDOR Vulnerabilities
Remove unsafe bypass options for specific IDs. Ensure authenticated users can only request their own specific orders.
```typescript
// SECURE VERSION
try {
  decoded = jwt.verify(token, JWT_SECRET) as any;
  if (decoded.userId !== userId && decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Access denied to other users\' orders.' });
  }
} catch (err) { ... }
```

### Step 4: Secure Public Admin Routes
Protect the database seeding endpoint by attaching the administration authorization middleware.
```typescript
// SECURE VERSION
app.post("/api/admin/force-seed", verifyAdminToken, async (req, res) => { ... });
```

### Step 5: Enforce Environmental Variables
Block application startup if mandatory secrets are missing. This prevents fallback security weaknesses from going unnoticed.
```typescript
if (!process.env.JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is not defined. Refusing to start the server for security integrity.");
}
if (!process.env.ADMIN_KEY) {
  throw new Error("CRITICAL: ADMIN_KEY environment variable is not defined. Refusing to start the server for security integrity.");
}
```
