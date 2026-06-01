const fs = require("fs");
const path = "src/components/UserProfileDashboard.tsx";
let code = fs.readFileSync(path, "utf8");

code = code.replace(
  /className="lg:hidden mt-2 mb-4 animate-in slide-in-from-top-2 duration-300"/g,
  'className="lg:hidden mt-4 mb-6 animate-in slide-in-from-top-2 duration-300 -mx-6"'
);

code = code.replace(
  /<div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-inner overflow-hidden">/g,
  '<div className="bg-neutral-950\/50 border-y border-neutral-800 p-6 sm:px-8 shadow-inner overflow-hidden">'
);

fs.writeFileSync(path, code);
console.log("Fixed mobile widths!");
