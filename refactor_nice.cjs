const fs = require('fs');

const path = 'src/components/UserProfileDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Find the start of the tabs
const tabsStart = code.indexOf('{/* TAB CONTENT: 1. Personal Info');
if (tabsStart === -1) {
  console.log('tabsStart not found');
  process.exit(1);
}

// 2. Find the end of the tabs. The last tab ends at line 1133 around `)}`.
// We can locate `          </div>\n        </div>\n\n      </div>\n    </div>` which closes the main container wrapper.
const mainContainerEnd = code.indexOf('          </div>\n        </div>\n\n      </div>\n    </div>');
if (mainContainerEnd === -1) {
  console.log('mainContainerEnd not found');
  process.exit(1);
}

// The tabs code is everything between tabsStart and mainContainerEnd
const tabsCode = code.slice(tabsStart, mainContainerEnd);

// 3. Find the main return statement at line 271
const mainReturnStart = code.indexOf('  return (\n    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">');
if (mainReturnStart === -1) {
  console.log('mainReturnStart not found');
  process.exit(1);
}

// 4. Construct the `renderTabContents` function and insert it before the main return
const renderTabContentsStr = `  const tabContents = () => (
    <>
      ${tabsCode.trim()}
    </>
  );\n\n`;

const codeBeforeReturn = code.slice(0, mainReturnStart);
const codeRest = code.slice(mainReturnStart, tabsStart); // from main return up to where tabs started!

// 5. Build the wrapper for the desktop right column
const desktopWrapperReplacement = `            {tabContents()}\n`;

// 6. Assemble base modified code
let updatedCode = codeBeforeReturn + renderTabContentsStr + codeRest + desktopWrapperReplacement + code.slice(mainContainerEnd);

// 7. Hide the right column entirely on mobile, but keep styles on desktop
updatedCode = updatedCode.replace(
  '<div className="lg:col-span-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 space-y-6">',
  '<div className="hidden lg:block lg:col-span-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 space-y-6">'
);

// 8. Inject the mobile accordions right below each nav button
const tabsList = ['personal', 'orders', 'address', 'wishlist', 'security', 'support'];
tabsList.forEach(tab => {
    const endOfButtonRegex = new RegExp(`onClick\\{\\(\\) => setActiveTab\\('${tab}'\\)\\}[\\s\\S]*?<\\/button>`);
    const match = updatedCode.match(endOfButtonRegex);
    if (match) {
       updatedCode = updatedCode.replace(
           match[0], 
           match[0] + `\n              <div className="lg:hidden mt-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-inner overflow-hidden">
                   {activeTab === '${tab}' && tabContents()}
                </div>
              </div>`
       );
    }
});

fs.writeFileSync(path, updatedCode, 'utf8');
console.log('Refactoring applied successfully with elegant solution.');
