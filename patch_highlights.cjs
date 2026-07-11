const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Highlight active users
code = code.replace(
  '<h3 className="text-neutral-400 text-sm font-medium">Active Users</h3>',
  '<h3 className="text-neutral-400 text-sm font-medium flex items-center gap-2">Active Users <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">Mocked</span></h3>'
);

// Highlight chart (Analytics tab and Dashboard tab)
code = code.replace(
  '<h2 className="text-lg font-bold text-white">Revenue Overview</h2>',
  '<h2 className="text-lg font-bold text-white flex items-center gap-2">Revenue Overview <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 font-normal tracking-wide">Not connected to backend (Mock Data)</span></h2>'
);

code = code.replace(
  '<h2 className="text-lg font-bold text-white mb-6">Revenue & Orders Trend</h2>',
  '<h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">Revenue & Orders Trend <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 font-normal tracking-wide">Not connected to backend (Mock Data)</span></h2>'
);

// Highlight map (Delivery tab)
code = code.replace(
  '<h3 className="text-lg font-bold text-white">Live Tracking Map</h3>',
  '<h3 className="text-lg font-bold text-white flex items-center gap-2">Live Tracking Map <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 font-normal tracking-wide">Not connected to backend (Mock UI)</span></h3>'
);


fs.writeFileSync('src/components/AdminDashboard.tsx', code);
