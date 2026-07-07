const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
code = code.replace(
  'if (newProductForm.name && newProductForm.price) {',
  'if (newProductForm.name.trim() !== "" && newProductForm.price >= 0) {'
);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
