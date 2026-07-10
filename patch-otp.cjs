const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /  const subject = "Tizzitech Admin Portal - Your Access Code";\n  const html = \`<div>\$\{otp\}<\/div>\`;\n\n  try \{\n    await sendEmail\(email, subject, html\);\n    res\.json\(\{ success: true, message: 'OTP sent successfully' \}\);\n  \} catch \(err\) \{\n    res\.json\(\{ success: true, message: 'OTP logged', devOtp: process\.env\.NODE_ENV !== 'production' \? otp : undefined \}\);\n  \}/,
  `  const subject = "Tizzitech Admin Portal - Your Access Code";
  const html = \`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Admin Login Attempt</h2>
      <p>Please use the following 6-digit access code to securely log in to the admin portal:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #fff; background: #111; padding: 15px; border-radius: 8px; text-align: center;">\${otp}</div>
      <p style="color: #888; font-size: 12px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
    </div>\`;

  try {
    await sendEmail(email, subject, html);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
       res.json({ success: true, message: 'OTP simulated (SMTP not configured)', devOtp: otp });
    } else {
       res.json({ success: true, message: 'OTP sent successfully' });
    }
  } catch (err) {
    res.json({ success: true, message: 'OTP logged', devOtp: otp });
  }`
);

fs.writeFileSync('server.ts', code);
