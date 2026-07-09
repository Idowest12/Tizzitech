const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const updatedOtpEndpoints = `
const adminOtps = new Map();
const adminSessions = new Map();

app.post('/api/admin/send-otp', async (req, res) => {
  const { email } = req.body;
  if (email !== 'idowutosin70@gmail.com') {
    return res.status(403).json({ success: false, message: 'Unauthorized email' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  adminOtps.set(email, {
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  });

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

app.post('/api/admin/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  if (email !== 'idowutosin70@gmail.com') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const record = adminOtps.get(email);
  if (!record) {
    return res.status(400).json({ success: false, message: 'No OTP requested or expired.' });
  }

  if (Date.now() > record.expires) {
    adminOtps.delete(email);
    return res.status(400).json({ success: false, message: 'OTP expired.' });
  }

  if (record.otp === otp) {
    adminOtps.delete(email);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    adminSessions.set(email, { ip, userAgent });
    return res.json({ success: true });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }
});

app.post('/api/admin/validate-session', (req, res) => {
  const { email } = req.body;
  if (email !== 'idowutosin70@gmail.com') {
    return res.status(403).json({ valid: false });
  }

  const session = adminSessions.get(email);
  if (!session) {
    return res.json({ valid: false, reason: 'No active session' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  if (session.ip !== ip || session.userAgent !== userAgent) {
    adminSessions.delete(email); // Invalidate on mismatch
    return res.json({ valid: false, reason: 'Session hijacked or network changed' });
  }

  return res.json({ valid: true });
});

app.post('/api/admin/logout', (req, res) => {
  const { email } = req.body;
  if (email) adminSessions.delete(email);
  res.json({ success: true });
});
`;

code = code.replace(
  /const adminOtps = new Map\(\);[\s\S]*?app\.post\('\/api\/admin\/verify-otp'[\s\S]*?\}\);/m,
  updatedOtpEndpoints.trim()
);

fs.writeFileSync('server.ts', code);
