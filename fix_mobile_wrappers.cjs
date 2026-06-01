const fs = require('fs');

const path = 'src/components/UserProfileDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

const tabsList = ['personal', 'orders', 'address', 'wishlist', 'security', 'support'];

tabsList.forEach(tab => {
    // We are looking for the exact injected block:
    const injectedStr = `<div className="lg:hidden mt-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-inner overflow-hidden">
                   {activeTab === '${tab}' && tabContents()}
                </div>
              </div>`;
              
    const fixedStr = `{activeTab === '${tab}' && (
              <div className="lg:hidden mt-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-inner overflow-hidden">
                   {tabContents()}
                </div>
              </div>
            )}`;
            
    code = code.replace(injectedStr, fixedStr);
});

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed wrappers');
