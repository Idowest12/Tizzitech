const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  '<button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors">\n                  Generate Invoice\n                </button>',
  '<button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors">\n                  Print Invoices List\n                </button>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
