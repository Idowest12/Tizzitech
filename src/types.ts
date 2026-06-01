export type Category = 'Laptops' | 'Phones' | 'Mouse' | 'Keyboards' | 'Chargers' | 'Earpod' | 'Earpiece' | 'Case Protector' | 'Screen Guard';
export type Condition = 'New' | 'Used';

export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5 stars
  comment: string;
  date: string;
}

export interface Product {
  id: string; // Document ID
  name: string;
  category: string;
  brand: string;
  price: number;
  condition: string;
  specs?: Record<string, string>;
  stock: number;
  imageUrl: string;
  images?: string[];
  description?: string;
  createdAt?: any;
  updatedAt?: any;
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Confirmed' | 'Accepted' | 'Shipped' | 'In Transit' | 'Delivered';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  orderDate: Date;
  expectedDeliveryDate: Date;
  address: string;
}

