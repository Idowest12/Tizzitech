const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const otpEndpoints = `
// ========================================================
// 16. ADMIN OTP ENDPOINTS
// ========================================================
const adminOtps = new Map();

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
    // Even if it fails (e.g. SMTP not configured), we can still return success in Dev
    // but in a real situation SMTP must be configured.
    res.json({ success: true, message: 'OTP logged (SMTP might not be configured)', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
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
    return res.json({ success: true });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }
});

`;

code = code.replace('// ========================================================', otpEndpoints + '// ========================================================');
fs.writeFileSync('server.ts', code);
