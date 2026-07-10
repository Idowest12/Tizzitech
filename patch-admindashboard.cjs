const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
    /import \{ Package, Plus, Search/g, 
    "import { Package, Plus, Search, ShieldAlert, KeyRound "
);

code = code.replace(
    /export function AdminDashboard\(\{ products, orders, visits = \[\], onUpdateStock, onUpdateOrderStatus, onAddProduct, onGoHome, onLogout \}: AdminDashboardProps\) \{/g, 
    "export function AdminDashboard({ products, orders, visits = [], auditLogs = [], onUpdateStock, onUpdateOrderStatus, onAddProduct, onGoHome, onLogout }: AdminDashboardProps) {"
);

code = code.replace(
    /type TabType = 'dashboard' \| 'analytics' \| 'sales-report' \| 'orders' \| 'products' \| 'attributes' \| 'customers' \| 'invoices' \| 'discounts' \| 'delivery' \| 'featured' \| 'newsletter';/g,
    "type TabType = 'dashboard' | 'analytics' | 'sales-report' | 'orders' | 'products' | 'attributes' | 'customers' | 'invoices' | 'discounts' | 'delivery' | 'featured' | 'newsletter' | 'admins';"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
