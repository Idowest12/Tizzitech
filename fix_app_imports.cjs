const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `import { initialProducts, CATEGORIES } from "./data";`,
  `import { initialProducts, CATEGORIES as FALLBACK_CATEGORIES, BRANDS as FALLBACK_BRANDS } from "./data";`
);

fs.writeFileSync('src/App.tsx', code);
