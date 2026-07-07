const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `const [maxPrice, setMaxPrice] = useState<number>(highestPriceLimit);`,
  `const [maxPrice, setMaxPrice] = useState<number>(highestPriceLimit);
  const [brandsList, setBrandsList] = useState(FALLBACK_BRANDS);
  const [categoriesList, setCategoriesList] = useState(FALLBACK_CATEGORIES);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);`
);

code = code.replace(
  `import { initialProducts, categoriesList } from "./data";`,
  `import { initialProducts, CATEGORIES } from "./data";`
);

fs.writeFileSync('src/App.tsx', code);
