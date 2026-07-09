const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /\/\/ 16\. ADMIN OTP ENDPOINTS[\s\S]*?\/\/ ========================================================/m;

const replacement = `// 16. ADMIN OTP ENDPOINTS
// ========================================================

const crypto = require('crypto');

function getDocId(email) {
  const secret = process.env.ADMIN_KEY || 'default_secret';
  return crypto.createHmac('sha256', secret).update(email).digest('hex');
}

app.post('/api/admin/send-otp', async (req, res) => {
  const { email } = req.body;
  if (email !== 'idowutosin70@gmail.com') {
    return res.status(403).json({ success: false, message: 'Unauthorized email' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
  const docId = getDocId(email);
  const secret = process.env.ADMIN_KEY || 'default_secret';
  const hashedOtp = crypto.createHmac('sha256', secret).update(otp).digest('hex');

  const firebasedb = getFirebaseDb();
  if (firebasedb) {
    try {
      await setDoc(doc(firebasedb, 'admin_otps', docId), { hash: hashedOtp, expires });
    } catch(e) {
      console.error("Failed to save OTP to Firestore", e);
    }
  }

  const subject = "Tizzitech Admin Portal - Your Access Code";
  const html = \`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Admin Login Attempt</h2>
      <p>Please use the following 6-digit access code to securely log in to the admin portal:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #fff; background: #111; padding: 15px; border-radius: 8px; text-align: center;">\${otp}</div>
      <p style="color: #888; font-size: 12px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
    </div>
  \`;

  try {
    await sendEmail(email, subject, html);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    res.json({ success: true, message: 'OTP logged', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
  }
});

app.post('/api/admin/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (email !== 'idowutosin70@gmail.com') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const docId = getDocId(email);
  const firebasedb = getFirebaseDb();
  
  if (!firebasedb) {
    return res.status(500).json({ success: false, message: 'Database not configured' });
  }

  try {
    const snap = await getDoc(doc(firebasedb, 'admin_otps', docId));
    if (!snap.exists()) {
      return res.status(400).json({ success: false, message: 'No OTP requested or expired.' });
    }
    const record = snap.data();
    if (Date.now() > record.expires) {
      await deleteDoc(doc(firebasedb, 'admin_otps', docId));
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }

    const secret = process.env.ADMIN_KEY || 'default_secret';
    const hashedOtp = crypto.createHmac('sha256', secret).update(otp).digest('hex');

    if (record.hash === hashedOtp) {
      await deleteDoc(doc(firebasedb, 'admin_otps', docId));
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      const sessionDocId = getDocId(email + "_session");
      await setDoc(doc(firebasedb, 'admin_sessions', sessionDocId), { ip, userAgent });

      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
  } catch (e) {
    console.error("OTP Verification Error:", e);
    return res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
});

app.post('/api/admin/validate-session', async (req, res) => {
  const { email } = req.body;
  if (email !== 'idowutosin70@gmail.com') {
    return res.status(403).json({ valid: false });
  }

  const firebasedb = getFirebaseDb();
  if (!firebasedb) {
     return res.json({ valid: false, reason: 'No DB' });
  }

  const sessionDocId = getDocId(email + "_session");
  try {
    const snap = await getDoc(doc(firebasedb, 'admin_sessions', sessionDocId));
    if (!snap.exists()) {
      return res.json({ valid: false, reason: 'No active session' });
    }
    const session = snap.data();
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (session.ip !== ip || session.userAgent !== userAgent) {
      await deleteDoc(doc(firebasedb, 'admin_sessions', sessionDocId)); // Invalidate on mismatch
      return res.json({ valid: false, reason: 'Session hijacked or network changed' });
    }

    return res.json({ valid: true });
  } catch (e) {
     console.error("Validation error:", e);
     return res.json({ valid: false, reason: 'Server error' });
  }
});

app.post('/api/admin/logout', async (req, res) => {
  const { email } = req.body;
  if (email) {
    const sessionDocId = getDocId(email + "_session");
    const firebasedb = getFirebaseDb();
    if (firebasedb) {
      try {
        await deleteDoc(doc(firebasedb, 'admin_sessions', sessionDocId));
      } catch(e) {}
    }
  }
  res.json({ success: true });
});

// ========================================================`;

code = code.replace(regex, replacement);

// We need to make sure deleteDoc is imported
if (!code.includes('deleteDoc')) {
  code = code.replace(
    /import \{ getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, getDoc, query, where, runTransaction \} from 'firebase\/firestore';/,
    "import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, getDoc, query, where, runTransaction, deleteDoc } from 'firebase/firestore';"
  );
}

fs.writeFileSync('server.ts', code);
