const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `  try {
    await sendEmail(email, subject, html);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
       res.json({ success: true, message: 'OTP simulated (SMTP not configured)', devOtp: otp });
    } else {
       res.json({ success: true, message: 'OTP sent successfully' });
    }
  } catch (err) {
    res.json({ success: true, message: 'OTP logged', devOtp: otp });
  }`;

const replacement = `  try {
    await sendEmail(email, subject, html);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
       res.json({ success: true, message: 'OTP simulated (SMTP not configured)', devOtp: otp });
    } else {
       res.json({ success: true, message: 'OTP sent successfully' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to send OTP email: ' + err.message });
  }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
