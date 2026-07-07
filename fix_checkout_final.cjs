const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutView.tsx', 'utf-8');

code = code.replace(
  `status: "Pending" || 'Confirmed',`,
  `status: 'Confirmed',`
);

fs.writeFileSync('src/components/CheckoutView.tsx', code);
