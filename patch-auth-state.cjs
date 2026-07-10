const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  /            if \(valData\.valid\) \{\n              logAuditActivity\('LOGIN_ATTEMPT', 'Successful auto-login via valid session', user\.email\);\n              setIsAuthenticated\(true\);\n              return;\n            \} else \{\n              logAuditActivity\('LOGIN_ATTEMPT', 'Session invalid or hijacked - requiring OTP', user\.email\);\n            \}\n          \} catch\(e\) \{ console\.error\(e\); \}\n\n          setAuthStep\('otp'\);\n          try \{\n            const res = await fetch\('\/api\/admin\/send-otp', \{\n              method: 'POST',\n              headers: \{ 'Content-Type': 'application\/json' \},\n              body: JSON\.stringify\(\{ email: user\.email \}\)\n            \}\);\n            const data = await res\.json\(\);\n            if \(data\.devOtp\) \{\n              console\.log\("DEV OTP:", data\.devOtp\); \/\/ For dev preview\n              alert\("SMTP is not configured! Simulated Email OTP: " \+ data\.devOtp \+ "\\n\\nPlease configure SMTP_HOST, SMTP_USER, SMTP_PASS in the Environment settings for real emails to work\."\);\n            \}\n          \} catch \(e\) \{\n            console\.error\("Failed to send OTP", e\);\n          \}/,
  `            if (valData.valid) {
              logAuditActivity('LOGIN_ATTEMPT', 'Successful auto-login via valid session', user.email);
              setIsAuthenticated(true);
              return;
            } else {
              logAuditActivity('LOGIN_ATTEMPT', 'Session invalid or missing - requiring fresh login', user.email);
              // Important: Instead of automatically sending an OTP, we sign them out of the stale Firebase session
              // so they can choose their email account again when they click "Sign in with Google".
              if (authStep === 'login') {
                await signOut(auth);
                return;
              }
            }
          } catch(e) { console.error(e); }
          
          if (authStep === 'login') return; // Don't proceed if they haven't manually initiated

          setAuthStep('otp');
          try {
            const res = await fetch('/api/admin/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email })
            });
            const data = await res.json();
            if (data.devOtp) {
              console.log("DEV OTP:", data.devOtp); // For dev preview
              alert("SMTP is not configured! Simulated Email OTP: " + data.devOtp + "\\n\\nPlease configure SMTP_HOST, SMTP_USER, SMTP_PASS in the Environment settings for real emails to work.");
            }
          } catch (e) {
            console.error("Failed to send OTP", e);
          }`
);

fs.writeFileSync('src/AdminApp.tsx', code);
