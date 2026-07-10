const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
    /import \{ NewsletterAdmin \} from '\.\/NewsletterAdmin';/g,
    "import { NewsletterAdmin } from './NewsletterAdmin';\nimport { AdminManager } from './AdminManager';"
);

code = code.replace(
    /\{activeTab === 'newsletter' && \(/g,
    "{activeTab === 'admins' && (\n            <div className=\"p-8 animate-fade-in overflow-y-auto h-full\">\n              <AdminManager />\n            </div>\n          )}\n\n          {activeTab === 'newsletter' && ("
);

code = code.replace(
    /!\['dashboard', 'analytics', 'sales-report', 'orders', 'products', 'delivery', 'newsletter'\]\.includes\(activeTab\)/g,
    "!['dashboard', 'analytics', 'sales-report', 'orders', 'products', 'delivery', 'newsletter', 'admins'].includes(activeTab)"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
