import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface Partner {
  id: string;
  name: string;
  email: string;
  password?: string;
  slug: string;
  couponCode: string;
  amazonUrl?: string;
  bookBabyUrl?: string;
  commissionPercent: number;
  clickBounty: number;
  discountPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  partnerId: string;
  type: 'PAGE_VIEW' | 'CLICK_AMAZON' | 'CLICK_BOOKBABY' | 'CLICK_DIRECT';
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  device?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  partnerId?: string;
  stripeSessionId: string;
  totalAmount: number;
  commissionEarned: number;
  customerEmail?: string;
  status: 'COMPLETED' | 'REFUNDED' | 'FAILED';
  createdAt: string;
}

export interface Payout {
  id: string;
  partnerId: string;
  amount: number;
  status: 'PROCESSING' | 'PAID' | 'FAILED';
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  createdAt: string;
}

// Phase 2: User (Customer) model
export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  name?: string;
  activeSessionToken?: string; // "One Device" enforcement
  createdAt: string;
  updatedAt: string;
}

// Phase 2: Digital Book model
export interface DigitalBook {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description?: string;
  coverImage: string;
  fileUrl: string; // Private S3/Blob URL
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Phase 2: Library Access model
export interface LibraryAccess {
  id: string;
  userId: string;
  bookId: string;
  orderId?: string;
  grantedAt: string;
}

export interface Database {
  partners: Partner[];
  events: TrackingEvent[];
  orders: Order[];
  payouts: Payout[];
  users: User[];
  books: DigitalBook[];
  libraryAccess: LibraryAccess[];
}

export function readDb(): Database {
  if (!fs.existsSync(DB_PATH)) {
    return { partners: [], events: [], orders: [], payouts: [], users: [], books: [], libraryAccess: [] };
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const data = JSON.parse(raw);
  return {
    partners: data.partners || [],
    events: data.events || [],
    orders: data.orders || [],
    payouts: data.payouts || [],
    users: data.users || [],
    books: data.books || [],
    libraryAccess: data.libraryAccess || [],
  };
}

export function writeDb(data: Database) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function generateId(): string {
  return uuidv4();
}

export function getPartnerBySlug(slug: string): Partner | undefined {
  const db = readDb();
  return db.partners.find((p) => p.slug === slug);
}

export function getPartnerById(id: string): Partner | undefined {
  const db = readDb();
  return db.partners.find((p) => p.id === id);
}

export function createTrackingEvent(event: Omit<TrackingEvent, 'id' | 'createdAt'>): TrackingEvent {
  const db = readDb();
  const newEvent: TrackingEvent = {
    ...event,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  db.events.push(newEvent);
  writeDb(db);
  return newEvent;
}

export function getPartnerEvents(partnerId: string): TrackingEvent[] {
  const db = readDb();
  return db.events.filter((e) => e.partnerId === partnerId);
}

export function getPartnerOrders(partnerId: string): Order[] {
  const db = readDb();
  return db.orders.filter((o) => o.partnerId === partnerId);
}

export function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const db = readDb();
  const newOrder: Order = {
    ...order,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  db.orders.push(newOrder);
  writeDb(db);
  return newOrder;
}

export function getPartnerStats(partnerId: string) {
  const events = getPartnerEvents(partnerId);
  const orders = getPartnerOrders(partnerId);
  
  const pageViews = events.filter((e) => e.type === 'PAGE_VIEW').length;
  const amazonClicks = events.filter((e) => e.type === 'CLICK_AMAZON').length;
  const bookBabyClicks = events.filter((e) => e.type === 'CLICK_BOOKBABY').length;
  const directClicks = events.filter((e) => e.type === 'CLICK_DIRECT').length;
  
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = completedOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
  
  const partner = getPartnerById(partnerId);
  const clickBountyEarned = (amazonClicks + bookBabyClicks) * (partner?.clickBounty || 0.10);
  
  return {
    pageViews,
    amazonClicks,
    bookBabyClicks,
    directClicks,
    directSales: completedOrders.length,
    totalRevenue,
    totalCommission,
    clickBountyEarned,
    pendingPayout: totalCommission + clickBountyEarned,
    conversionRate: pageViews > 0 ? ((completedOrders.length / pageViews) * 100) : 0,
  };
}

export function getRecentEvents(partnerId: string, limit: number = 10): TrackingEvent[] {
  const events = getPartnerEvents(partnerId);
  return events
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getAllStats() {
  const db = readDb();
  
  const totalPageViews = db.events.filter((e) => e.type === 'PAGE_VIEW').length;
  const totalAmazonClicks = db.events.filter((e) => e.type === 'CLICK_AMAZON').length;
  const totalBookBabyClicks = db.events.filter((e) => e.type === 'CLICK_BOOKBABY').length;
  const totalDirectClicks = db.events.filter((e) => e.type === 'CLICK_DIRECT').length;
  
  const completedOrders = db.orders.filter((o) => o.status === 'COMPLETED');
  const totalDirectRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommissionOwed = completedOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
  
  const retentionRate = totalPageViews > 0 
    ? ((totalDirectClicks / totalPageViews) * 100) 
    : 0;
  const bounceToRetailer = totalPageViews > 0 
    ? (((totalAmazonClicks + totalBookBabyClicks) / totalPageViews) * 100) 
    : 0;
  
  return {
    totalVisits: totalPageViews,
    totalAmazonClicks,
    totalBookBabyClicks,
    totalDirectClicks,
    totalDirectSales: completedOrders.length,
    totalDirectRevenue,
    totalCommissionOwed,
    retentionRate,
    bounceToRetailer,
    partnerCount: db.partners.length,
  };
}
