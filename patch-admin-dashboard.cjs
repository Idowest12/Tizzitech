const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "interface AdminDashboardProps {",
  "interface AdminDashboardProps {\n  auditLogs?: any[];"
);

code = code.replace(
  "export function AdminDashboard({ visits = [], products, orders, onUpdateStock, onUpdateOrderStatus, onAddProduct, onLogout, onGoHome }: AdminDashboardProps) {",
  "export function AdminDashboard({ visits = [], auditLogs = [], products, orders, onUpdateStock, onUpdateOrderStatus, onAddProduct, onLogout, onGoHome }: AdminDashboardProps) {"
);

const navItemsReplacement = `
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: ShieldAlert }
  ];
`;

code = code.replace(
  /    \{ id: 'invoices', label: 'Invoices', icon: FileText \},\n    \{ id: 'newsletter', label: 'Newsletter', icon: Mail \}\n  \];/,
  navItemsReplacement.trim()
);

const auditLogsTab = `
          {activeTab === 'audit-logs' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-3"><ShieldAlert className="w-6 h-6 text-emerald-500" /> Security & Audit Logs</h1>
                  <p className="text-neutral-400 text-sm mt-1">Review system access, security events, and administrative activities.</p>
                </div>
              </div>
              
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Timestamp</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Action</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Admin Email</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Details</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800 text-right">Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-black/30 transition-colors">
                        <td className="p-4">
                           <div className="text-sm font-medium text-neutral-300">{new Date(log.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="p-4">
                          <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest \${
                            log.action === 'LOGIN_ATTEMPT' ? 'bg-blue-500/10 text-blue-400' :
                            log.action === 'LOGOUT' ? 'bg-neutral-500/10 text-neutral-400' :
                            log.action === 'STOCK_UPDATE' ? 'bg-purple-500/10 text-purple-400' :
                            log.action === 'ORDER_UPDATE' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-neutral-800 text-neutral-300'
                          }\`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-neutral-300">{log.email}</td>
                        <td className="p-4 text-sm text-neutral-400">{log.details}</td>
                        <td className="p-4 text-xs text-neutral-500 text-right space-y-1">
                           <div>IP: {log.ip || 'unknown'}</div>
                           <div className="truncate max-w-[200px]" title={log.userAgent}>{log.userAgent || 'unknown'}</div>
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">No audit logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
`;

code = code.replace(
  /          \{activeTab === 'newsletter' && \([\s\S]*?<\/div>\n          \)\}/,
  "{activeTab === 'newsletter' && (\n            <div className=\"animate-in fade-in space-y-6\">\n              <NewsletterAdmin />\n            </div>\n          )}\n" + auditLogsTab
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
