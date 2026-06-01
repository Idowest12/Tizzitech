const fs = require("fs");
const path = "src/components/UserProfileDashboard.tsx";
let code = fs.readFileSync(path, "utf8");

code = code.replace(
  'type Tab =\n  | "personal"\n  | "orders"\n  | "address"\n  | "security"\n  | "wishlist"\n  | "support";',
  'type Tab =\n  | "personal"\n  | "orders"\n  | "address"\n  | "security"\n  | "wishlist"\n  | "support"\n  | "";'
);

// We might have different formatting due to prettier, so let's use regex
const typeRegex = /type Tab =[\s\S]*?\| "support";/;
if (typeRegex.test(code)) {
  code = code.replace(typeRegex, `type Tab = "personal" | "orders" | "address" | "security" | "wishlist" | "support" | "";`);
}

const tabs = ["personal", "orders", "address", "wishlist", "security", "support"];
tabs.forEach(tab => {
  // Replace onClick={() => setActiveTab("something")}
  const target = `onClick={() => setActiveTab("${tab}")}`;
  const replacement = `onClick={() => {\n                  if (window.innerWidth < 1024) {\n                    setActiveTab(activeTab === "${tab}" ? "" : "${tab}");\n                  } else {\n                    setActiveTab("${tab}");\n                  }\n                }}`;
  
  code = code.replace(target, replacement);
});

fs.writeFileSync(path, code);
console.log("Updated button logic!");
