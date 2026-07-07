const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// The pattern inserted was:
const searchPattern = `              <div className="flex justify-between items-center bg-black py-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-900 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Search orders by ID, email, or name..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>\n`;

code = code.split(searchPattern).join('');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
