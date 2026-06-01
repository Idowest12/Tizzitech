const fs = require('fs');

const path = 'src/components/UserProfileDashboard.tsx';
let currentCode = fs.readFileSync(path, 'utf8');

// 1. We know renderTabFuncStr starts with `  const renderTabContent = (tab: Tab) => {`
// and ends with `      </>\n    );\n  };\n`

const funcStart = currentCode.indexOf('  const renderTabContent = (tab: Tab) => {');
const funcEndStr = `      </>\n    );\n  };\n`;
const funcEnd = currentCode.indexOf(funcEndStr, funcStart) + funcEndStr.length;

// Extract what was originally `fullRightCol`
// Inside the function, it started with `      <>\n{/* Main Container Wrapper */}`
// and ended right before `      </>`
const fullRightColStart = currentCode.indexOf('{/* Main Container Wrapper */}', funcStart);
const fullRightColEnd = currentCode.indexOf('      </>', fullRightColStart) - 1; // remove the newline maybe
let fullRightCol = currentCode.slice(fullRightColStart, fullRightColEnd);

// Reverse the targetTab mapping
fullRightCol = fullRightCol.replace(/tab ===/g, 'activeTab ===');

// The original returnMatch location was exactly where funcStart is
let codeBeforeFunc = currentCode.slice(0, funcStart);

// The code between funcEnd and the injected desktopRightCol:
// That code went up to where `rColStart` originally was!
// So desktopRightCol starts with `          <div className="hidden lg:block w-full h-full">\n            {renderTabContent(activeTab)}\n          </div>\n`
const desktopRightColStr = `          <div className="hidden lg:block w-full h-full">\n            {renderTabContent(activeTab)}\n          </div>\n`;
const desktopRightColStart = currentCode.indexOf(desktopRightColStr);
const desktopRightColEnd = desktopRightColStart + desktopRightColStr.length;

let codeBetweenFuncAndDesktop = currentCode.slice(funcEnd, desktopRightColStart);
// codeBetweenFuncAndDesktop should begin with '\n  ' + `return (\n      <div...` and end right before desktopRightColStart.
// Wait, when I created updatedCode1:
// updatedCode1 = code.slice(0, returnMatch) + renderTabFuncStr + '\n  ' + code.slice(returnMatch, rColStart);
// So codeBetweenFuncAndDesktop is exactly `\n  ' + code.slice(returnMatch, rColStart)`. We just need to remove the '\n  ' at the beginning.
if (codeBetweenFuncAndDesktop.startsWith('\n  ')) {
    codeBetweenFuncAndDesktop = codeBetweenFuncAndDesktop.slice(3);
} else {
    codeBetweenFuncAndDesktop = codeBetweenFuncAndDesktop.trimStart();
}

// Now the code after desktopRightCol:
let codeAfterDesktop = currentCode.slice(desktopRightColEnd);

// We need to restore the `<nav>` buttons back by removing the injected mobile views.
// We injected:
/*
\n              <div className="lg:hidden mt-2 mb-4 animate-in slide-in-from-top-2 duration-300">
                {renderTabContent('personal')}
              </div>
*/
const tabs = ['personal', 'orders', 'address', 'wishlist', 'security', 'support'];
tabs.forEach(tab => {
    const injectedStr = `\n              <div className="lg:hidden mt-2 mb-4 animate-in slide-in-from-top-2 duration-300">\n                {renderTabContent('${tab}')}\n              </div>`;
    codeBetweenFuncAndDesktop = codeBetweenFuncAndDesktop.replace(injectedStr, '');
});

// original code reconstruction:
let originalCode = codeBeforeFunc + codeBetweenFuncAndDesktop + fullRightCol + codeAfterDesktop;

fs.writeFileSync(path, originalCode, 'utf8');
console.log('Restoration completed!');
