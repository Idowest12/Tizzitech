const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /<NavItem tab="newsletter" icon=\{Mail\} label="Newsletter" \/>/g,
  '<NavItem tab="newsletter" icon={Mail} label="Newsletter" />\n          <NavItem tab="admins" icon={ShieldAlert} label="Administrators" />'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
