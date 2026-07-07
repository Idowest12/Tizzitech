const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "getDoc(doc(db, 'settings', 'global')).then(snap => {",
  "getDoc(doc(db, 'newsletter_campaigns', 'global_settings')).then(snap => {"
);

code = code.replace(
  "await setDoc(doc(db, 'settings', 'global')",
  "await setDoc(doc(db, 'newsletter_campaigns', 'global_settings')"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
