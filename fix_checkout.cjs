const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutView.tsx', 'utf-8');

code = code.replace(
  `interface CheckoutViewProps {
  cart: CartItem[];
  hasPastOrders?: boolean;
  onComplete: (order: Order) => void;
  onCancel: () => void;
}`,
  `interface CheckoutViewProps {
  cart: CartItem[];
  hasPastOrders?: boolean;
  onComplete: (order: Order) => void;
  onCancel: () => void;
  deliveryZones?: any[];
  user?: any;
  updateProfile?: any;
}`
);

code = code.replace(
  `export function CheckoutView({ cart, hasPastOrders, onComplete, onCancel }: CheckoutViewProps) {`,
  `export function CheckoutView({ cart, hasPastOrders, onComplete, onCancel, deliveryZones = [], user, updateProfile }: CheckoutViewProps) {`
);

code = code.replace(
  /const getDeliveryFee = \(selectedLga: string\) => \{[\s\S]*?return 5000;\n\s*\};/,
  `const getDeliveryFee = (selectedLga: string) => {
    if (!selectedLga) return 0;
    const zone = deliveryZones.find((z: any) => z.zone.toLowerCase() === selectedLga.toLowerCase());
    if (zone) return zone.fee;
    switch (selectedLga) {
      case 'Eti-Osa': return 7000;
      case 'Oshodi-Isolo': return 4000;
      case 'Shomolu': return 3500;
      case 'Badagry': return 6000;
      case 'Alimosho': return 3000;
      case 'Mushin': return 3000;
      default: return 5000;
    }
  };`
);

// fix id message status orderDate expectedDeliveryDate errors
code = code.replace(
  `if (!data.success)`,
  `if (!data.success) {
    setErrorMessage((data as any).message || 'Failed to place order.');
    setIsSuccess(false);
    return;
  }`
);

code = code.replace(/data\.orderId \|\| data\.id/g, 'orderId');
code = code.replace(/data\.id/g, 'orderId');
code = code.replace(/data\.status/g, '"Pending"');
code = code.replace(/data\.orderDate/g, 'newOrderData.orderDate');
code = code.replace(/data\.expectedDeliveryDate/g, 'new Date().toISOString()');

fs.writeFileSync('src/components/CheckoutView.tsx', code);
