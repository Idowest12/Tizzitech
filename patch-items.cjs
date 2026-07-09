const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  '₦{item.price.toLocaleString()}',
  '₦{(item.price || 0).toLocaleString()}'
);

code = code.replace(
  '₦{(item.price * item.quantity).toLocaleString()}',
  '₦{((item.price || 0) * (item.quantity || 0)).toLocaleString()}'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
