const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  'INV-{receiptOrder.id.slice(2, 10).toUpperCase()}',
  'INV-{(receiptOrder.id ? String(receiptOrder.id).slice(0, 8).toUpperCase() : "UNKNOWN")}'
);

code = code.replace(
  '{new Date(receiptOrder.orderDate).toLocaleDateString()}',
  '{receiptOrder.orderDate ? new Date(receiptOrder.orderDate).toLocaleDateString() : "Unknown Date"}'
);

code = code.replace(
  'receiptOrder.items.map',
  '(receiptOrder.items || []).map'
);

code = code.replace(
  '₦{receiptOrder.total.toLocaleString()}',
  '₦{receiptOrder.total ? receiptOrder.total.toLocaleString() : "0"}'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
