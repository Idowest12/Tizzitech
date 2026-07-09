const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /<button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-colors">\s*<Plus className="h-4 w-4" \/> Add Code\s*<\/button>/g,
  '<button onClick={() => alert("Coupon creation requires backend support. Feature coming soon!")} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-colors"><Plus className="h-4 w-4" /> Add Code</button>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
