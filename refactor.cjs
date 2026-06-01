const fs = require('fs');

const path = 'src/components/UserProfileDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Find the start of the right column tab contents
const rColStart = code.indexOf('{/* Main Container Wrapper */}');
if (rColStart === -1) {
  console.log('rColStart not found');
  process.exit(1);
}

const returnMatch = code.indexOf('return (');
const mainContainerEndPos = code.lastIndexOf('</div>\n        </div>\n\n      </div>\n    </div>');

if (mainContainerEndPos === -1) {
    console.log('mainContainerEndPos not found');
    process.exit(1);
}

const fullRightCol = code.slice(rColStart, mainContainerEndPos);

const renderTabFuncStr = `
  const renderTabContent = (tab: Tab) => {
    if (activeTab !== tab) return null;
    return (
      <>
${fullRightCol.replace(/activeTab ===/g, 'tab ===')}
      </>
    );
  };
`;

const updatedCode1 = code.slice(0, returnMatch) + renderTabFuncStr + '\n  ' + code.slice(returnMatch, rColStart);

const desktopRightCol = `          <div className="hidden lg:block w-full h-full">
            {renderTabContent(activeTab)}
          </div>
`;

let finalCode = updatedCode1 + desktopRightCol + code.slice(mainContainerEndPos);

const tabs = ['personal', 'orders', 'address', 'wishlist', 'security', 'support'];
tabs.forEach(tab => {
    const endOfButtonRegex = new RegExp(`onClick\\{\\(\\) => setActiveTab\\('${tab}'\\)\\}[\\s\\S]*?<\\/button>`);
    const match = finalCode.match(endOfButtonRegex);
    if (match) {
       finalCode = finalCode.replace(
           match[0], 
           match[0] + `\n              <div className="lg:hidden mt-2 mb-4 animate-in slide-in-from-top-2 duration-300">
                {renderTabContent('${tab}')}
              </div>`
       );
    }
});

fs.writeFileSync(path, finalCode, 'utf8');
console.log('Refactoring applied successfully.');
