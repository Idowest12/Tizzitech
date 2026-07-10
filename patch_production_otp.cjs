const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `  try {
    await sendEmail(email, subject, html);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
       res.json({ success: true, message: 'OTP simulated (SMTP not configured)', devOtp: otp });
    } else {
       res.json({ success: true, message: 'OTP sent successfully' });
    }
  } catch (err: any) {`;

const replacement = `  try {
    await sendEmail(email, subject, html);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
       if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
         res.json({ success: true, message: 'OTP simulated (SMTP not configured)', devOtp: otp });
       } else {
         res.status(500).json({ success: false, message: 'SMTP is not configured in production. Cannot send OTP.' });
       }
    } else {
       res.json({ success: true, message: 'OTP sent successfully' });
    }
  } catch (err: any) {`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
