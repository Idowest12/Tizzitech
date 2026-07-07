const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const receiptFn = `  const generateReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(\`
        <html>
          <head>
            <title>Invoice - \${order.id}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .invoice-title { font-size: 20px; color: #666; }
              .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
              .table th { background-color: #f8f9fa; font-weight: bold; text-transform: uppercase; font-size: 12px; }
              .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; color: #777; font-size: 12px; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Tizzitech</div>
              <div class="invoice-title">RECEIPT / INVOICE</div>
            </div>
            <div class="details">
              <div>
                <strong>Billed To:</strong><br>
                \${order.shipping.firstName} \${order.shipping.surname}<br>
                \${order.shipping.address}<br>
                \${order.shipping.city}, \${order.shipping.stateLocation}
              </div>
              <div style="text-align: right;">
                <strong>Invoice Number:</strong> INV-\${order.id.slice(2, 10).toUpperCase()}<br>
                <strong>Date:</strong> \${new Date(order.orderDate).toLocaleDateString()}<br>
                <strong>Status:</strong> <span style="text-transform:uppercase;">\${order.status}</span>
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                \${order.items.map(item => \`
                  <tr>
                    <td>\${item.name}</td>
                    <td>\${item.quantity}</td>
                    <td>₦\${item.price.toLocaleString()}</td>
                    <td>₦\${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
            <div class="total">
              Total Amount: ₦\${order.total.toLocaleString()}
            </div>
            <div class="footer">
              Thank you for shopping with Tizzitech!<br>
              If you have any questions about this receipt, please contact support@tizzitech.com.
            </div>
          </body>
        </html>
      \`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

`;

code = code.replace(
  "  // Delivery Zones state",
  receiptFn + "  // Delivery Zones state"
);

code = code.replace(
  /<button className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">Download PDF<\/button>/g,
  '<button onClick={() => generateReceipt(order)} className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">Download PDF</button>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
