const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Insert a state for users in AdminDashboard
const targetState = `  const [activeTab, setActiveTab] = useState<TabType>('dashboard');`;
const replacementState = `  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'customers') {
      setLoadingUsers(true);
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      fetch('/api/admin/users', {
        headers: { 'Authorization': \`Bearer \$\{token\}\` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUsers(data.users);
          }
          setLoadingUsers(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingUsers(false);
        });
    }
  }, [activeTab]);`;

code = code.replace(targetState, replacementState);

const targetCustomers = `{activeTab === 'customers' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Customers</h1>
                  <p className="text-neutral-400 text-sm mt-1">View and manage your customer database.</p>
                </div>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Customer</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Location</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Orders</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {/* Mock distinct customers from orders */}
                    {Array.from(new Set(orders.map(o => o.address))).map((address, idx) => {
                       const customerOrders = orders.filter(o => o.address === address);
                       const spent = customerOrders.reduce((sum, o) => sum + o.total, 0);
                       return (
                         <tr key={idx} className="hover:bg-neutral-900/30 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                    C{idx + 1}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white">Customer {idx + 1}</p>
                                    <p className="text-xs text-neutral-500">customer{idx + 1}@example.com</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-sm text-neutral-400 max-w-[200px] truncate">{address}</td>
                           <td className="py-4 px-6 text-sm text-white font-mono">{customerOrders.length}</td>
                           <td className="py-4 px-6 text-sm text-white font-mono font-bold">₦{spent.toLocaleString()}</td>
                         </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}`;

const replacementCustomers = `{activeTab === 'customers' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Customers</h1>
                  <p className="text-neutral-400 text-sm mt-1">View and manage your registered users.</p>
                </div>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Customer</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Location</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Role</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Welcome Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {loadingUsers ? (
                      <tr><td colSpan={4} className="py-4 px-6 text-center text-neutral-500">Loading users...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={4} className="py-4 px-6 text-center text-neutral-500">No users found.</td></tr>
                    ) : users.map((user, idx) => (
                         <tr key={user.id} className="hover:bg-neutral-900/30 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold uppercase">
                                    {(user.firstname?.[0] || 'U')}{(user.lastname?.[0] || '')}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white">{user.firstname} {user.lastname}</p>
                                    <p className="text-xs text-neutral-500">{user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-sm text-neutral-400 max-w-[200px] truncate">{user.address || 'N/A'}</td>
                           <td className="py-4 px-6 text-sm text-white font-mono">{user.role || 'user'}</td>
                           <td className="py-4 px-6">
                             <div className="flex flex-col items-start gap-1">
                               {user.welcomeEmailSent === true && (
                                 <span className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1 font-bold uppercase tracking-widest">
                                   <CheckCircle className="w-3 h-3" /> Sent
                                 </span>
                               )}
                               {user.welcomeEmailSent === false && user.emailError && (
                                 <span className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded-full flex items-center gap-1 font-bold uppercase tracking-widest" title={user.emailError}>
                                   <AlertCircle className="w-3 h-3" /> Failed
                                 </span>
                               )}
                               {user.welcomeEmailSent === undefined && (
                                 <span className="text-[10px] px-2 py-1 bg-neutral-800 text-neutral-400 rounded-full flex items-center gap-1 font-bold uppercase tracking-widest">
                                   N/A
                                 </span>
                               )}
                             </div>
                           </td>
                         </tr>
                       )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}`;

code = code.replace(targetCustomers, replacementCustomers);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
