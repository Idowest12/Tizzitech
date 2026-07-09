const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const regex = /const generateReceipt = \(order: Order\) => \{[\s\S]*?alert\("Please allow popups to generate the receipt\."\);\n    \}\n  \};/;

const newGenerateReceipt = `const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const generateReceipt = (order: Order) => {
    setReceiptOrder(order);
  };`;

code = code.replace(regex, newGenerateReceipt);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
