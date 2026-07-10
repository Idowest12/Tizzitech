const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// For Register
const targetRegister = `      await sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
      
      return res.json({ success: true, token, user: { id: userId, email, firstName, surname, address, phone, role: 'user' } });`;

const replacementRegister = `      let welcomeEmailSent = false;
      let emailError = null;
      try {
        await sendEmail(email, welcomeSubject, welcomeHtml);
        welcomeEmailSent = true;
      } catch (err: any) {
        console.error("Async email failed:", err);
        emailError = err.message;
      }
      try {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', userId), { welcomeEmailSent, emailError: emailError || null });
      } catch (e) {}
      
      return res.json({ success: true, token, user: { id: userId, email, firstName, surname, address, phone, role: 'user' } });`;

code = code.replace(targetRegister, replacementRegister);

// For Google Login (db path)
const targetGoogle = `          await sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
        }

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });`;

const replacementGoogle = `          let welcomeEmailSent = false;
          let emailError = null;
          try {
            await sendEmail(email, welcomeSubject, welcomeHtml);
            welcomeEmailSent = true;
          } catch (err: any) {
            console.error("Async email failed:", err);
            emailError = err.message;
          }
          try {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', user.id), { welcomeEmailSent, emailError: emailError || null });
          } catch (e) {}
        }

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });`;

code = code.replace(targetGoogle, replacementGoogle);

// For Newsletter
const targetNewsletter = `      await sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
      
      return res.json({ success: true, message: 'Successfully subscribed' });`;

const replacementNewsletter = `      let welcomeEmailSent = false;
      let emailError = null;
      try {
        await sendEmail(email, welcomeSubject, welcomeHtml);
        welcomeEmailSent = true;
      } catch (err: any) {
        console.error("Async email failed:", err);
        emailError = err.message;
      }
      try {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(newSubRef, { welcomeEmailSent, emailError: emailError || null });
      } catch (e) {}
      
      return res.json({ success: true, message: 'Successfully subscribed' });`;

code = code.replace(targetNewsletter, replacementNewsletter);

fs.writeFileSync('server.ts', code);
