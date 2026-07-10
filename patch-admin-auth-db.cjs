const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regexSendOtp = /app\.post\('\/api\/admin\/send-otp', async \(req, res\) => \{\n  const \{ email \} = req\.body;\n  if \(email !== 'idowutosin70@gmail\.com'\) \{\n    return res\.status\(403\)\.json\(\{ success: false, message: 'Unauthorized email' \}\);\n  \}/m;

const replacementSendOtp = `app.post('/api/admin/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }

  const firebasedb = getFirebaseDb();
  if (!firebasedb) {
    return res.status(500).json({ success: false, message: 'Database not configured' });
  }

  // Check if email exists in the admins collection
  try {
    const adminDocs = await getDocs(query(collection(firebasedb, 'admins'), where('email', '==', email)));
    if (adminDocs.empty) {
      return res.status(403).json({ success: false, message: 'Unauthorized email' });
    }
  } catch (err) {
    console.error("Error checking admin collection:", err);
    return res.status(500).json({ success: false, message: 'Server error checking admin privileges' });
  }`;

code = code.replace(regexSendOtp, replacementSendOtp);

const regexVerifyOtp = /app\.post\('\/api\/admin\/verify-otp', async \(req, res\) => \{\n  const \{ email, otp \} = req\.body;\n  if \(email !== 'idowutosin70@gmail\.com'\) \{\n    return res\.status\(403\)\.json\(\{ success: false, message: 'Unauthorized' \}\);\n  \}/m;

const replacementVerifyOtp = `app.post('/api/admin/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  const firebasedb = getFirebaseDb();
  if (!firebasedb) {
    return res.status(500).json({ success: false, message: 'Database not configured' });
  }

  try {
    const adminDocs = await getDocs(query(collection(firebasedb, 'admins'), where('email', '==', email)));
    if (adminDocs.empty) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
  } catch (err) {
    console.error("Error checking admin collection:", err);
    return res.status(500).json({ success: false, message: 'Server error checking admin privileges' });
  }`;

code = code.replace(regexVerifyOtp, replacementVerifyOtp);


const regexValidateSession = /app\.post\('\/api\/admin\/validate-session', async \(req, res\) => \{\n  const \{ email \} = req\.body;\n  if \(email !== 'idowutosin70@gmail\.com'\) \{\n    return res\.status\(403\)\.json\(\{ valid: false \}\);\n  \}/m;

const replacementValidateSession = `app.post('/api/admin/validate-session', async (req, res) => {
  const { email } = req.body;
  
  const firebasedb = getFirebaseDb();
  if (!firebasedb) {
     return res.json({ valid: false, reason: 'No DB' });
  }

  try {
    const adminDocs = await getDocs(query(collection(firebasedb, 'admins'), where('email', '==', email)));
    if (adminDocs.empty) {
      return res.status(403).json({ valid: false });
    }
  } catch (err) {
    console.error("Error checking admin collection:", err);
    return res.status(500).json({ valid: false });
  }`;

code = code.replace(regexValidateSession, replacementValidateSession);

fs.writeFileSync('server.ts', code);
