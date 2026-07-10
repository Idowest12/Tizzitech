const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  /if \(data\.devOtp\) \{\n              console\.log\("DEV OTP:", data\.devOtp\); \/\/ For dev preview\n            \}/g,
  `if (data.devOtp) {
              console.log("DEV OTP:", data.devOtp); // For dev preview
              alert("SMTP is not configured! Simulated Email OTP: " + data.devOtp + "\\n\\nPlease configure SMTP_HOST, SMTP_USER, SMTP_PASS in the Environment settings for real emails to work.");
            }`
);

fs.writeFileSync('src/AdminApp.tsx', code);
