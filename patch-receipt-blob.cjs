const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const oldReceiptLogicStart = `const generateReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const doc = printWindow.document;
      doc.open();
      doc.write(\``;

const oldReceiptLogicEnd = `      \`);
      doc.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } else {
      alert("Please allow popups to generate the receipt.");
    }
  };`;

// We need to replace the entire generateReceipt function
const fullGenerateReceiptRegex = /const generateReceipt = \(order: Order\) => \{[\s\S]*?alert\("Please allow popups to generate the receipt\."\);\n    \}\n  \};/;

const newReceiptLogic = `const generateReceipt = (order: Order) => {
    const htmlContent = \`
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
            <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div class="logo" style="display: flex; align-items: center; gap: 10px;">
                  <img src="\${window.location.origin}/logo.svg" alt="Tizzitech Logo" style="height: 48px;" />
                </div>
                <div style="color: #666; font-size: 14px; margin-top: 5px;">Premium Tech & Accessories</div>
              </div>
              <div class="invoice-title" style="text-align: right;">
                <div style="font-size: 24px; color: #333;">RECEIPT / INVOICE</div>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">Original Copy</div>
              </div>
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
              This is a computer-generated document. No signature is required.
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
    \`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      alert("Please allow popups to generate the receipt.");
    }
  };`;

code = code.replace(fullGenerateReceiptRegex, newReceiptLogic);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
