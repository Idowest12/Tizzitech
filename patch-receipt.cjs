const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const oldReceiptLogic = `const generateReceipt = (order: Order) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();`;

const newReceiptLogic = `const generateReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const doc = printWindow.document;
      doc.open();`;

code = code.replace(oldReceiptLogic, newReceiptLogic);

code = code.replace(/doc\.close\(\);\n      setTimeout\(\(\) => \{\n        iframe\.contentWindow\?\.focus\(\);\n        iframe\.contentWindow\?\.print\(\);\n        setTimeout\(\(\) => document\.body\.removeChild\(iframe\), 1000\);\n      \}, 500\);\n    \}/, `doc.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } else {
      alert("Please allow popups to generate the receipt.");
    }`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
