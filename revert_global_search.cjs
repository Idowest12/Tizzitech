const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const newSearchInput = `<input 
              type="text" 
              placeholder="Search products or orders..." 
              value={search || orderSearch}
              onChange={(e) => {
                setSearch(e.target.value);
                setOrderSearch(e.target.value);
                if (activeTab !== 'products' && activeTab !== 'orders') {
                  setActiveTab('products');
                }
              }}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />`;

const originalSearchInput = `<input 
              type="text" 
              placeholder="Search navigation tabs..." 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />`;

code = code.replace(newSearchInput, originalSearchInput);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Reverted global search.");
