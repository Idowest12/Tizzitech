const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  />Download PDF<\/button>/g,
  '>Generate Receipt</button>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
