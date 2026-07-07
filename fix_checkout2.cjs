const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutView.tsx', 'utf-8');

code = code.replace(
  `export function CheckoutView({ cart, hasPastOrders, onComplete, onCancel, deliveryZones = [], user, updateProfile }: CheckoutViewProps) {`,
  `export function CheckoutView({ cart, hasPastOrders, onComplete, onCancel, deliveryZones = [] }: CheckoutViewProps) {`
);

code = code.replace(
  `  user?: any;
  updateProfile?: any;`,
  ``
);

code = code.replace(
  `status: "Pending" || "Pending",`,
  `status: "Pending" as any,`
);

code = code.replace(
  `setErrorMessage((data as any).message || 'Failed to place order.');`,
  `setErrorMessage(data.message || 'Failed to place order.');`
);

fs.writeFileSync('src/components/CheckoutView.tsx', code);
