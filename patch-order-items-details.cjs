const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /<p className="text-sm text-white font-bold">\{productRef.name \|\| 'Unknown Product'\}<\/p>\s*<p className="text-xs text-neutral-500">Qty: \{item.quantity\}<\/p>/g,
  `<p className="text-sm text-white font-bold">{productRef.name || 'Unknown Product'}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs text-neutral-500">Qty: {item.quantity}</span>
                                {productRef.brand && <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">{productRef.brand}</span>}
                                {productRef.condition && <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">{productRef.condition}</span>}
                                {productRef.category && <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">{productRef.category}</span>}
                              </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
