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
  costPrice?: number;
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

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Accepted' | 'Shipped' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface OrderEmailEvent {
  date: Date;
  subject: string;
  recipient: string;
  status: 'Sent' | 'Failed' | 'Pending';
}

export interface Order {
  email?: string;
  fullname?: string;
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  orderDate: Date;
  expectedDeliveryDate: Date;
  address: string;
  emailHistory?: OrderEmailEvent[];
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  badge?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export interface HeroConfig {
  slides: HeroSlide[];
  deliveryHeader: string;
  deliveryAreas: string[];
  autoplaySpeed?: number; // in seconds, default 5
}

export interface LaunchSettings {
  targetDate: string; // ISO date string e.g. "2026-12-22T00:00:00+01:00"
  isLaunched: boolean;
  title?: string;
  announcement?: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface TechArticle {
  id: string;
  title: string;
  subtitle?: string;
  badge: string;
  date: string;
  author?: string;
  imageUrl: string;
  images?: string[];
  summary?: string;
  paragraphs: string[];
  keyUpgrades?: string[];
  specs?: Record<string, string>;
  ctaText?: string;
  ctaLink?: string;
  featured?: boolean;
}

export interface TechOfTheDayConfig {
  headline?: string;
  subheadline?: string;
  articles: TechArticle[];
  lastUpdated?: string;
}

