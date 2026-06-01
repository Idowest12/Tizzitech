const fs = require("fs");
const path = "src/components/UserProfileDashboard.tsx";
let code = fs.readFileSync(path, "utf8");

const tabs = ["personal", "orders", "address", "wishlist", "security", "support"];

tabs.forEach(tab => {
  // We need to find the </button> after `setActiveTab("${tab}")` or `setActiveTab('${tab}')`
  let tabIdx = code.indexOf(`setActiveTab("${tab}")`);
  if (tabIdx === -1) {
    tabIdx = code.indexOf(`setActiveTab('${tab}')`);
  }
  
  if (tabIdx !== -1) {
    // Find the next </button>
    const nextBtnClose = code.indexOf("</button>", tabIdx);
    if (nextBtnClose !== -1) {
      const injectionPoint = nextBtnClose + "</button>".length;
      
      const toInject = `\n              {activeTab === '${tab}' && (
                <div className="lg:hidden mt-2 mb-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-inner overflow-hidden">
                     {tabContents()}
                  </div>
                </div>
              )}`;
              
      // only inject if not already there
      if (code.slice(injectionPoint, injectionPoint + 50).indexOf("lg:hidden") === -1) {
        code = code.slice(0, injectionPoint) + toInject + code.slice(injectionPoint);
      }
    }
  }
});

fs.writeFileSync(path, code);
console.log("Injected wrappers!");
