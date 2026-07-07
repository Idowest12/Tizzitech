#!/bin/bash
sed -i 's/const \[search, setSearch\] = useState('\'\'');/const [search, setSearch] = useState('\'''\'');\n  const [orderSearch, setOrderSearch] = useState('\'''\'');/' src/components/AdminDashboard.tsx

# Create filteredOrders
sed -i '/const filteredProducts/i\
  const filteredOrders = orders.filter(o =>\
    (o.id || "").toLowerCase().includes(orderSearch.toLowerCase()) ||\
    (o.email || "").toLowerCase().includes(orderSearch.toLowerCase()) ||\
    (o.fullname || o.address || "").toLowerCase().includes(orderSearch.toLowerCase())\
  );' src/components/AdminDashboard.tsx

# Replace orders.length with filteredOrders.length in the orders table area
sed -i 's/orders.length === 0/filteredOrders.length === 0/g' src/components/AdminDashboard.tsx
sed -i 's/orders.map((order)/filteredOrders.map((order)/g' src/components/AdminDashboard.tsx

# Add the search input above the orders table
sed -i '/<div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">/i\
              <div className="flex justify-between items-center bg-black py-4">\
                <div className="relative w-full max-w-md">\
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />\
                  <input\
                    type="text"\
                    className="w-full bg-neutral-950 border border-neutral-900 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"\
                    placeholder="Search orders by ID, email, or name..."\
                    value={orderSearch}\
                    onChange={(e) => setOrderSearch(e.target.value)}\
                  />\
                </div>\
              </div>' src/components/AdminDashboard.tsx
