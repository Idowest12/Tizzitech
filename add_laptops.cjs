const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf-8');

const newProducts = `
  {
    id: 'p26',
    name: 'Asus ROG Zephyrus G14',
    category: 'Laptops',
    brand: 'Asus',
    price: 1850000,
    condition: 'New',
    specs: { ram: '32GB', storage: '1TB SSD', processor: 'AMD Ryzen 9', graphics: 'RTX 4070', display: '14" OLED' },
    description: 'The definitive 14-inch gaming laptop. Incredibly powerful, ultra-portable, and features a gorgeous OLED display for both gamers and creators.',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p27',
    name: 'Apple MacBook Air M3',
    category: 'Laptops',
    brand: 'Apple',
    price: 1350000,
    condition: 'New',
    specs: { ram: '16GB', storage: '512GB SSD', processor: 'Apple M3', display: '13.6" Liquid Retina' },
    description: 'The completely redesigned MacBook Air, supercharged by M3. Thin, light, and powerful with up to 18 hours of battery life.',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p28',
    name: 'HP Spectre x360 14',
    category: 'Laptops',
    brand: 'HP',
    price: 1550000,
    condition: 'New',
    specs: { ram: '16GB', storage: '1TB SSD', processor: 'Intel Core Ultra 7', display: '14" OLED Touch' },
    description: 'A premium 2-in-1 convertible laptop. Stunning design meets high performance, featuring a vivid OLED touchscreen and included stylus.',
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p29',
    name: 'Lenovo Legion Pro 7i',
    category: 'Laptops',
    brand: 'Lenovo',
    price: 2400000,
    condition: 'New',
    specs: { ram: '32GB', storage: '2TB SSD', processor: 'Intel Core i9 14th Gen', graphics: 'RTX 4080', display: '16" 240Hz' },
    description: 'Esports-ready gaming laptop. Dominate the competition with bleeding-edge specs and Lenovo’s advanced Coldfront cooling system.',
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p30',
    name: 'Razer Blade 16',
    category: 'Laptops',
    brand: 'Razer',
    price: 3200000,
    condition: 'New',
    specs: { ram: '32GB', storage: '2TB SSD', processor: 'Intel Core i9', graphics: 'RTX 4090', display: '16" Dual-Mode Mini-LED' },
    description: 'The pinnacle of gaming laptops. Impossibly thin CNC aluminum chassis packed with an RTX 4090 and the world’s first dual-mode display.',
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p31',
    name: 'Dell Alienware m18 R2',
    category: 'Laptops',
    brand: 'Dell',
    price: 2850000,
    condition: 'New',
    specs: { ram: '64GB', storage: '2TB SSD', processor: 'Intel Core i9', graphics: 'RTX 4080', display: '18" QHD+ 165Hz' },
    description: 'A desktop replacement like no other. Experience massive screen real estate and unparalleled performance in an iconic Alienware chassis.',
    stock: 7,
    imageUrl: 'https://images.unsplash.com/photo-1593642702821-c823b13eb295?auto=format&fit=crop&w=800&q=80',
    reviews: []
  }
];
`;

data = data.replace(/];\s*export const BRANDS/, ',' + newProducts.trim().slice(0, -2) + '];\nexport const BRANDS');

data = data.replace(
  /export const BRANDS = \[(.*?)\];/,
  "export const BRANDS = [$1, 'Asus', 'Razer'];"
);

fs.writeFileSync('src/data.ts', data);
