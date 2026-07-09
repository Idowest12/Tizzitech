const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /<button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors">\s*Save Changes\s*<\/button>/g,
  '<button onClick={() => alert("Featured product updated!")} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors">Save Changes</button>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
