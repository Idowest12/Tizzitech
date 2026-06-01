const fs = require("fs");
const path = "src/components/UserProfileDashboard.tsx";
let code = fs.readFileSync(path, "utf8");

const tabs = ["personal", "orders", "address", "wishlist", "security", "support"];

tabs.forEach(tab => {
  code = code.replace(
    `{activeTab === '${tab}' && (\n                <div className="lg:hidden mt-2`,
    `{activeTab === '${tab}' && (\n                <div id={'mobile-tab-'+'${tab}'} className="lg:hidden mt-2`
  );
});

// Add useEffect
const useEffectInjection = `
  useEffect(() => {
    // Only scroll logic for mobile where the tab unfolds inline
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById('mobile-tab-' + activeTab);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Desktop scroll to top of the dashboard main content
      setTimeout(() => {
        const el = document.getElementById('desktop-main-tab-content');
        if (el) {
           // We'll scroll relative so the whole container is visible
           const y = el.getBoundingClientRect().top + window.scrollY - 100;
           window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [activeTab]);
`;

// Insert the useEffect right after the profile loaded useEffect
const targetHookRegex = /setLocalOrders\(orders\);\n  \}, \[orders\]\);/;
if (targetHookRegex.test(code)) {
  code = code.replace(targetHookRegex, `setLocalOrders(orders);\n  }, [orders]);\n${useEffectInjection}`);
}

// Add ID desktop-main-tab-content
code = code.replace(
  '<div className="hidden lg:block lg:col-span-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 space-y-6">',
  '<div id="desktop-main-tab-content" className="hidden lg:block lg:col-span-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 space-y-6">'
);

fs.writeFileSync(path, code);
console.log("Injected ids and scroll logic!");
