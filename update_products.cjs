const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf-8');

const newProducts = `
  {
    id: 'p13',
    name: 'iPhone 16 Pro',
    category: 'Phones',
    brand: 'Apple',
    price: 1800000,
    condition: 'New',
    specs: { ram: '8GB', storage: '256GB', processor: 'A18 Pro', display: '6.3" Super Retina XDR' },
    description: 'The iPhone 16 Pro features the advanced A18 Pro chip, a stunning titanium design, and next-generation camera capabilities with incredible low-light performance.',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p14',
    name: 'iPhone 17 Pro',
    category: 'Phones',
    brand: 'Apple',
    price: 2100000,
    condition: 'New',
    specs: { ram: '12GB', storage: '512GB', processor: 'A19 Pro', display: '6.3" ProMotion XDR' },
    description: 'The upcoming flagship iPhone 17 Pro with groundbreaking AI integrations, an under-display Face ID, and industry-leading performance.',
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p15',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Phones',
    brand: 'Samsung',
    price: 1650000,
    condition: 'New',
    specs: { ram: '12GB', storage: '512GB', processor: 'Snapdragon 8 Gen 3', display: '6.8" Dynamic AMOLED 2X' },
    description: 'Galaxy AI is here. Welcome to the era of mobile AI with the Galaxy S24 Ultra. Titanium exterior, flat display, and legendary S Pen.',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p16',
    name: 'Samsung Galaxy S25 Ultra',
    category: 'Phones',
    brand: 'Samsung',
    price: 1950000,
    condition: 'New',
    specs: { ram: '16GB', storage: '1TB', processor: 'Snapdragon 8 Gen 4', display: '6.9" Dynamic AMOLED' },
    description: 'The future of Samsung innovation, featuring an expanded AI suite, enhanced titanium frame, and revolutionary camera zoom capabilities.',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1606131731446-5568d87113aa?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p17',
    name: 'Google Pixel 7 Pro',
    category: 'Phones',
    brand: 'Google',
    price: 850000,
    condition: 'New',
    specs: { ram: '12GB', storage: '128GB', processor: 'Tensor G2', display: '6.7" LTPO OLED' },
    description: 'Google Pixel 7 Pro is Google’s best-of-everything phone. Powered by Google Tensor G2, it’s fast and secure, with an immersive display.',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p18',
    name: 'Google Pixel 8 Pro',
    category: 'Phones',
    brand: 'Google',
    price: 1100000,
    condition: 'New',
    specs: { ram: '12GB', storage: '256GB', processor: 'Tensor G3', display: '6.7" Super Actua' },
    description: 'The Pixel 8 Pro offers the brightest display yet, advanced AI photo editing, and the incredible new Tensor G3 chip.',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p19',
    name: 'Google Pixel 9 Pro',
    category: 'Phones',
    brand: 'Google',
    price: 1350000,
    condition: 'New',
    specs: { ram: '16GB', storage: '512GB', processor: 'Tensor G4', display: '6.7" Super Actua 2' },
    description: 'The Pixel 9 Pro redefines smartphone photography and AI performance. Smarter, faster, and more integrated into the Google ecosystem.',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p20',
    name: 'Google Pixel 10 Pro',
    category: 'Phones',
    brand: 'Google',
    price: 1600000,
    condition: 'New',
    specs: { ram: '16GB', storage: '1TB', processor: 'Tensor G5', display: '6.8" MicroLED' },
    description: 'The highly anticipated Google Pixel 10 Pro with a next-generation custom Tensor G5 chip and a stunning MicroLED display.',
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p21',
    name: 'Oraimo BoomPop 2',
    category: 'Headsets',
    brand: 'Oraimo',
    price: 45000,
    condition: 'New',
    specs: { connection: 'Bluetooth 5.2', battery: '40 Hours', feature: 'Deep Bass' },
    description: 'Oraimo BoomPop 2 over-ear wireless headphones. Powerful bass, long-lasting battery, and foldable design for easy carrying.',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p22',
    name: 'Sony WH-1000XM5',
    category: 'Headsets',
    brand: 'Sony',
    price: 350000,
    condition: 'New',
    specs: { connection: 'Bluetooth 5.2', battery: '30 Hours', feature: 'Industry-leading ANC' },
    description: 'Sony’s best-ever noise-canceling headphones with exceptional sound quality, comfort, and multiple device pairing.',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p23',
    name: 'Samsung Galaxy Buds 3 Pro',
    category: 'Earbuds',
    brand: 'Samsung',
    price: 220000,
    condition: 'New',
    specs: { connection: 'Bluetooth 5.3', battery: '30 Hours with Case', feature: 'Active Noise Cancelling' },
    description: 'Galaxy Buds 3 Pro feature a redesigned stem, high-fidelity audio, and intelligent active noise cancellation.',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p24',
    name: 'Apple AirPods Pro (2nd Gen)',
    category: 'Earbuds',
    brand: 'Apple',
    price: 250000,
    condition: 'New',
    specs: { connection: 'Bluetooth 5.3', battery: '30 Hours with Case', feature: 'H2 Chip' },
    description: 'AirPods Pro 2 feature up to 2x more Active Noise Cancellation, plus Adaptive Transparency, and Personalized Spatial Audio.',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p25',
    name: 'Oraimo FreePods 4',
    category: 'Earbuds',
    brand: 'Oraimo',
    price: 35000,
    condition: 'New',
    specs: { connection: 'Bluetooth 5.2', battery: '35 Hours with Case', feature: 'ANC & Transparency' },
    description: 'Oraimo FreePods 4 deliver active noise cancellation, heavy bass, and a durable battery for everyday use.',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    reviews: []
  }
];
`;

data = data.replace(/];\s*export const BRANDS/, ',' + newProducts.trim().slice(0, -2) + '];\nexport const BRANDS');

data = data.replace(
  /export const BRANDS = \[(.*?)\];/,
  "export const BRANDS = [$1, 'Google', 'Oraimo', 'Sony'];"
);

data = data.replace(
  /export const CATEGORIES = \[(.*?)\];/,
  "export const CATEGORIES = [$1, 'Headsets', 'Earbuds'];"
);

fs.writeFileSync('src/data.ts', data);
