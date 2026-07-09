const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const regex = /<div className="font-bold text-lg">\{receiptOrder\.shipping\.firstName\} \{receiptOrder\.shipping\.surname\}<\/div>\n\s*<div className="text-neutral-600 mt-1">\{receiptOrder\.shipping\.address\}<\/div>\n\s*<div className="text-neutral-600">\{receiptOrder\.shipping\.city\}, \{receiptOrder\.shipping\.stateLocation\}<\/div>/;

const newAddress = `<div className="font-bold text-lg">{receiptOrder.fullname || 'Customer'}</div>
                  <div className="text-neutral-600 mt-1">{receiptOrder.address}</div>
                  <div className="text-neutral-600">{receiptOrder.email || ''}</div>`;

code = code.replace(regex, newAddress);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
