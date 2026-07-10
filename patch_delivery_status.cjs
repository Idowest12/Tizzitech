const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Update server.ts
serverCode = serverCode.replace(
  /let welcomeEmailSent = false;\n\s*let emailError = null;\n\s*try \{\n\s*await sendEmail\(email, welcomeSubject, welcomeHtml\);\n\s*welcomeEmailSent = true;\n\s*\} catch \(err: any\) \{\n\s*console\.error\("Async email failed:", err\);\n\s*emailError = err\.message;\n\s*\}\n\s*try \{\n\s*const \{ updateDoc \} = await import\('firebase\/firestore'\);\n\s*await updateDoc\(doc\(db, 'users', userId\), \{ welcomeEmailSent, emailError: emailError \|\| null \}\);\n\s*\} catch \(e\) \{\}/g,
  `let deliveryStatus = 'pending';
      let emailError = null;
      try {
        await sendEmail(email, welcomeSubject, welcomeHtml);
        deliveryStatus = 'delivered';
      } catch (err: any) {
        console.error("Async email failed:", err);
        emailError = err.message;
        deliveryStatus = 'failed';
      }
      try {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', userId), { deliveryStatus, emailError: emailError || null });
      } catch (e) {}`
);

serverCode = serverCode.replace(
  /let welcomeEmailSent = false;\n\s*let emailError = null;\n\s*try \{\n\s*await sendEmail\(email, welcomeSubject, welcomeHtml\);\n\s*welcomeEmailSent = true;\n\s*\} catch \(err: any\) \{\n\s*console\.error\("Async email failed:", err\);\n\s*emailError = err\.message;\n\s*\}\n\s*try \{\n\s*const \{ updateDoc \} = await import\('firebase\/firestore'\);\n\s*await updateDoc\(doc\(db, 'users', user\.id\), \{ welcomeEmailSent, emailError: emailError \|\| null \}\);\n\s*\} catch \(e\) \{\}/g,
  `let deliveryStatus = 'pending';
          let emailError = null;
          try {
            await sendEmail(email, welcomeSubject, welcomeHtml);
            deliveryStatus = 'delivered';
          } catch (err: any) {
            console.error("Async email failed:", err);
            emailError = err.message;
            deliveryStatus = 'failed';
          }
          try {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', user.id), { deliveryStatus, emailError: emailError || null });
          } catch (e) {}`
);

serverCode = serverCode.replace(
  /let welcomeEmailSent = false;\n\s*let emailError = null;\n\s*try \{\n\s*await sendEmail\(email, welcomeSubject, welcomeHtml\);\n\s*welcomeEmailSent = true;\n\s*\} catch \(err: any\) \{\n\s*console\.error\("Async email failed:", err\);\n\s*emailError = err\.message;\n\s*\}\n\s*try \{\n\s*const \{ updateDoc \} = await import\('firebase\/firestore'\);\n\s*await updateDoc\(newSubRef, \{ welcomeEmailSent, emailError: emailError \|\| null \}\);\n\s*\} catch \(e\) \{\}/g,
  `let deliveryStatus = 'pending';
      let emailError = null;
      try {
        await sendEmail(email, welcomeSubject, welcomeHtml);
        deliveryStatus = 'delivered';
      } catch (err: any) {
        console.error("Async email failed:", err);
        emailError = err.message;
        deliveryStatus = 'failed';
      }
      try {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(newSubRef, { deliveryStatus, emailError: emailError || null });
      } catch (e) {}`
);

fs.writeFileSync('server.ts', serverCode);

// Update AdminDashboard.tsx
let adminCode = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
adminCode = adminCode.replace(
  /\{user\.welcomeEmailSent === true && \(/g,
  `{(user.deliveryStatus === 'delivered' || user.welcomeEmailSent === true) && (`
);
adminCode = adminCode.replace(
  /\{user\.welcomeEmailSent === false && user\.emailError && \(/g,
  `{(user.deliveryStatus === 'failed' || user.welcomeEmailSent === false) && user.emailError && (`
);
adminCode = adminCode.replace(
  /\{user\.welcomeEmailSent === undefined && \(/g,
  `{!user.deliveryStatus && user.welcomeEmailSent === undefined && (`
);
fs.writeFileSync('src/components/AdminDashboard.tsx', adminCode);

// Update NewsletterAdmin.tsx
let nlCode = fs.readFileSync('src/components/NewsletterAdmin.tsx', 'utf-8');
nlCode = nlCode.replace(
  /\{sub\.welcomeEmailSent === true && \(/g,
  `{(sub.deliveryStatus === 'delivered' || sub.welcomeEmailSent === true) && (`
);
nlCode = nlCode.replace(
  /\{sub\.welcomeEmailSent === false && sub\.emailError && \(/g,
  `{(sub.deliveryStatus === 'failed' || sub.welcomeEmailSent === false) && sub.emailError && (`
);
fs.writeFileSync('src/components/NewsletterAdmin.tsx', nlCode);

