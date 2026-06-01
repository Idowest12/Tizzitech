import { Product } from './types';

export const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'MacBook Pro 16" M2 Max',
    category: 'Laptops',
    brand: 'Apple',
    price: 3499000,
    condition: 'New',
    specs: { ram: '32GB', storage: '1TB SSD', processor: 'Apple M2 Max (12-core CPU)', graphics: '38-core GPU', display: '16.2" Liquid Retina XDR' },
    description: 'The ultimate pro laptop. With the incredible power of the M2 Max chip, experience game-changing performance and up to 22 hours of battery life. Featuring a stunning Liquid Retina XDR display, advanced camera and audio, and all the ports you need.',
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    reviews: [
      { id: 'r1', author: 'Abiodun O.', rating: 5, comment: 'Absolutely outstanding machine. The M2 Max is an absolute beast, compilations complete in seconds and the battery life is almost magical.', date: '2026-05-15' },
      { id: 'r2', author: 'Chioma N.', rating: 5, comment: 'Premium quality. Best screen I’ve ever experienced on any laptop.', date: '2026-05-22' }
    ]
  },
  {
    id: 'p2',
    name: 'Dell XPS 15',
    category: 'Laptops',
    brand: 'Dell',
    price: 1200000,
    condition: 'Used',
    specs: { ram: '16GB', storage: '512GB SSD', processor: 'Intel Core i7-12700H', graphics: 'NVIDIA GeForce RTX 3050 Ti', display: '15.6" FHD+' },
    description: 'A perfect balance of power and portability. This Dell XPS 15 is equipped with a 12th Gen Intel Core i7 processor and dedicated RTX graphics, making it ideal for content creators and professionals who need performance on the go, wrapped in a premium aluminum chassis.',
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80'
    ],
    reviews: [
      { id: 'r3', author: 'Tobi A.', rating: 4, comment: 'Great screen and powerful performance. The trackpad is huge and smooth. Battery is decent.', date: '2026-05-10' }
    ]
  },
  {
    id: 'p3',
    name: 'iPhone 13 Pro',
    category: 'Phones',
    brand: 'Apple',
    price: 699000,
    condition: 'Used',
    specs: { storage: '128GB', color: 'Graphite' },
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603792907191-89e55f70099a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=800&q=80'
    ],
    reviews: [
      { id: 'r4', author: 'Kelechi U.', rating: 5, comment: 'Clean and pristine condition as promised. Battery health is at 88% which is excellent for a used unit.', date: '2026-05-28' }
    ]
  },
  {
    id: 'p4',
    name: 'Samsung Galaxy S23 Ultra',
    category: 'Phones',
    brand: 'Samsung',
    price: 1199000,
    condition: 'New',
    specs: { storage: '256GB', color: 'Phantom Black' },
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1678911820864-e4c567cab6fb?auto=format&fit=crop&w=800&q=80',
    reviews: [
      { id: 'r5', author: 'Musa Y.', rating: 5, comment: 'The display is absolutely out of this world! The zoom camera feature is brilliant. Tizzitech delivered within 24 hours in Lagos.', date: '2026-05-29' }
    ]
  },
  {
    id: 'p5',
    name: 'Logitech MX Master 3S',
    category: 'Mouse',
    brand: 'Logitech',
    price: 99000,
    condition: 'New',
    specs: { type: 'Wireless Ergonomic' },
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    reviews: [
      { id: 'r6', author: 'Tolulope S.', rating: 5, comment: 'Highly recommend if you do a lot of office work or programming. Extremely comfortable with infinite scrolling.', date: '2026-05-18' }
    ]
  },
  {
    id: 'p6',
    name: 'Keychron K2 Wireless',
    category: 'Keyboards',
    brand: 'Keychron',
    price: 79000,
    condition: 'New',
    specs: { switch: 'Brown', type: 'Mechanical' },
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?auto=format&fit=crop&w=800&q=80',
    reviews: [
      { id: 'r7', author: 'Ngozi E.', rating: 4, comment: 'Feels great to type on, nice tactile response. Wish it was a bit slimmer, but key travel is ideal.', date: '2026-05-20' }
    ]
  },
  {
    id: 'p7',
    name: 'Anker 65W GaN Charger',
    category: 'Chargers',
    brand: 'Anker',
    price: 45000,
    condition: 'New',
    specs: { ports: '2x USB-C, 1x USB-A' },
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?auto=format&fit=crop&w=800&q=80',
    reviews: [
      { id: 'r8', author: 'Emeka O.', rating: 5, comment: 'Tiny but extremely powerful. Charges my MacBook, phone, and iPad all at the same time quickly.', date: '2026-05-25' }
    ]
  },
  {
    id: 'p8',
    name: 'Lenovo ThinkPad T14',
    category: 'Laptops',
    brand: 'Lenovo',
    price: 850000,
    condition: 'Used',
    specs: { ram: '16GB', storage: '256GB SSD', processor: 'Intel Core i5-1135G7', graphics: 'Intel Iris Xe Graphics', display: '14.0" FHD IPS' },
    description: 'The ThinkPad T14 is a highly durable and reliable business laptop. Powered by an 11th Gen Intel Core i5 processor, it offers excellent performance for multitasking and everyday workloads. Renowned for its comfortable keyboard and robust security features.',
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    reviews: [
      { id: 'r9', author: 'Olamide B.', rating: 5, comment: 'Incredibly durable, iconic typing experience. Keyboard feels much better than standard modern laptops.', date: '2026-05-23' }
    ]
  },
  {
    id: 'p9',
    name: 'Apple AirPods Pro (2nd Generation)',
    category: 'Earpod',
    brand: 'Apple',
    price: 195000,
    condition: 'New',
    specs: { chip: 'Apple H2', battery: 'Up to 6 hours listening time', wireless: 'Bluetooth 5.3', cancel: 'Active Noise Cancellation' },
    description: 'Rebuilt from the sound up. AirPods Pro feature up to 2x more Active Noise Cancellation, Adaptive Audio, and personalized Spatial Audio designed for premium comfort.',
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    reviews: [
      { id: 'r10', author: 'Sola W.', rating: 5, comment: 'Incredible active noise cancelling. It literally quietens the loudest chaotic sound of Lagos traffic!', date: '2026-05-24' }
    ]
  },
  {
    id: 'p10',
    name: 'Samsung AKG Type-C Wired Earphones',
    category: 'Earpiece',
    brand: 'Samsung',
    price: 12000,
    condition: 'New',
    specs: { connector: 'USB Type-C', sound: 'Tuned by AKG', driver: '2-way (11mm/8mm)' },
    description: 'Enjoy undistorted, studio-quality audio. Designed to separate left and right signals up to 10 times better than standard headphones for rich stereo sound.',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    reviews: [
      { id: 'r11', author: 'Kazeem O.', rating: 4, comment: 'Crisp high frequencies and very punchy bass. Best simple type-c earpiece for virtual meetings.', date: '2026-05-20' }
    ]
  },
  {
    id: 'p11',
    name: 'Apple Clear Case with MagSafe (iPhone 15 Pro)',
    category: 'Case Protector',
    brand: 'Apple',
    price: 45000,
    condition: 'New',
    specs: { material: 'Polycarbonate', technology: 'MagSafe Compatible' },
    description: 'Thin, light, and easy to grip — this Apple-designed clear case shows off the brilliant finish of your phone while providing heavy duty shock-absorbent drop protection.',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=800&q=80',
    reviews: []
  },
  {
    id: 'p12',
    name: 'Anker Tempered DoubleShield Screen Guard',
    category: 'Screen Guard',
    brand: 'Anker',
    price: 15000,
    condition: 'New',
    specs: { hardness: '9H Tempered Glass', thickness: '0.33mm', compatibility: 'iPhone 15 Pro Max Shield' },
    description: 'Ultra-thin, clear, scratch-resistant tempered glass screen protector with premium dual reinforced edges and oleophobic clean tracking touch surface.',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80',
    reviews: []
  }
];

export const BRANDS = ['Apple', 'Dell', 'Samsung', 'Logitech', 'Keychron', 'Anker', 'Lenovo', 'HP', 'Techno', 'Xiaomi', 'Infinix'];
export const CATEGORIES = ['Laptops', 'Phones', 'Mouse', 'Keyboards', 'Chargers', 'Earpod', 'Earpiece', 'Case Protector', 'Screen Guard'];
