const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /<button onClick=\{\(\) => setSelectedOrderDetails\(null\)\} className="text-neutral-500 hover:text-white transition-colors">\s*<XCircle className="h-6 w-6" \/>\s*<\/button>/g,
  `<div className="flex items-center gap-4">
                <button onClick={() => generateReceipt(selectedOrderDetails)} className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1 transition-colors">
                  <FileText className="h-4 w-4" /> Generate Receipt
                </button>
                <button onClick={() => setSelectedOrderDetails(null)} className="text-neutral-500 hover:text-white transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
