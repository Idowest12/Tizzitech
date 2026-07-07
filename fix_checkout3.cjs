const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutView.tsx', 'utf-8');

code = code.replace(
  `const data = { success: true, orderId };`,
  `const data: any = { success: true, orderId };`
);

code = code.replace(
  `status: "Pending" as any || "Pending",`,
  `status: "Pending" as any,`
);

code = code.replace(
  `status: "Pending" || "Pending",`,
  `status: "Pending" as any,`
);

fs.writeFileSync('src/components/CheckoutView.tsx', code);
