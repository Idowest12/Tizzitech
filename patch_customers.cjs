const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Orders</th>
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
                    {filteredOrders.length === 0 && (
                      <tr className="hover:bg-neutral-900/30 transition-colors">
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">JD</div>
                              <div>
                                 <p className="text-sm font-bold text-white">John Doe</p>
                                 <p className="text-xs text-neutral-500">john@example.com</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-neutral-400">Lagos, Nigeria</td>
                        <td className="py-4 px-6 text-sm text-white font-mono">0</td>
                        <td className="py-4 px-6 text-sm text-white font-mono font-bold">₦0</td>
                      </tr>
                    )}`;

const replacement = `                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Orders</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Products Bought</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {/* Distinct customers from orders */}
                    {Array.from(new Set(orders.map(o => o.email || o.address))).map((key, idx) => {
                       const customerOrders = orders.filter(o => (o.email || o.address) === key);
                       const spent = customerOrders.reduce((sum, o) => sum + o.total, 0);
                       const firstOrder = customerOrders[0];
                       const name = firstOrder?.fullname || \`Customer \${idx + 1}\`;
                       const email = firstOrder?.email || \`customer\${idx + 1}@example.com\`;
                       const address = firstOrder?.address || '';
                       const initials = name.substring(0, 2).toUpperCase();
                       const allProducts = customerOrders.flatMap(o => o.items.map(i => i.product.name));
                       const uniqueProducts = Array.from(new Set(allProducts));

                       return (
                         <tr key={idx} className="hover:bg-neutral-900/30 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                    {initials}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white">{name}</p>
                                    <p className="text-xs text-neutral-500">{email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-sm text-neutral-400 max-w-[200px] truncate">{address}</td>
                           <td className="py-4 px-6 text-sm text-white font-mono">{customerOrders.length}</td>
                           <td className="py-4 px-6 text-sm text-neutral-400">
                             <div className="flex flex-wrap gap-1">
                               {uniqueProducts.map((p, i) => (
                                 <span key={i} className="inline-block px-2 py-1 bg-neutral-900 rounded text-xs truncate max-w-[150px]">
                                   {p}
                                 </span>
                               ))}
                             </div>
                           </td>
                           <td className="py-4 px-6 text-sm text-white font-mono font-bold">₦{spent.toLocaleString()}</td>
                         </tr>
                       );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr className="hover:bg-neutral-900/30 transition-colors">
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">JD</div>
                              <div>
                                 <p className="text-sm font-bold text-white">John Doe</p>
                                 <p className="text-xs text-neutral-500">john@example.com</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-neutral-400">Lagos, Nigeria</td>
                        <td className="py-4 px-6 text-sm text-white font-mono">0</td>
                        <td className="py-4 px-6 text-sm text-neutral-400">No products</td>
                        <td className="py-4 px-6 text-sm text-white font-mono font-bold">₦0</td>
                      </tr>
                    )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
