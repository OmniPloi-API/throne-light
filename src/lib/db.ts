import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export type PartnerType = 'REV_SHARE' | 'FLAT_FEE';

export interface Partner {
  id: string;
  name: string;
  email: string;
  password?: string;
  slug: string;
  couponCode: string;
  accessCode?: string;
  amazonUrl?: string;      // Physical book on Amazon
  kindleUrl?: string;      // Digital book on Kindle
  bookBabyUrl?: string;    // Reserved for future use
  commissionPercent: number;
  clickBounty: number;
  discountPercent: number;
  partnerType: PartnerType; // REV_SHARE (earns commission) or FLAT_FEE (traffic only)
  autoWithdrawEnabled: boolean; // Rolling daily payouts on matured funds
  // Stripe Connect fields
  stripeAccountId?: string; // Stripe Connect Express account ID
  stripeOnboardingComplete: boolean; // Has completed Stripe onboarding
  taxFormVerified: boolean; // W-9 (US) or W-8BEN (International) submitted
  // Location & Payout settings
  country: string; // ISO country code (e.g., 'US', 'NG', 'GB')
  payoutMethod: 'STRIPE' | 'WISE' | 'CRYPTO' | 'MANUAL'; // Preferred payout method
  wiseEmail?: string; // For international fail-safe
  cryptoWallet?: string; // For crypto payout option
  lastPayoutMonth?: string; // Track for monthly fee (e.g., '2025-01')
  isActive: boolean; // Whether this partner campaign is active
  deactivatedAt?: string; // When the partner was deactivated
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  partnerId: string;
  type: 'PAGE_VIEW' | 'CLICK_AMAZON' | 'CLICK_KINDLE' | 'CLICK_BOOKBABY' | 'CLICK_DIRECT' | 'PENDING_SALE' | 'SALE';
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  device?: string;
  createdAt: string;
}

export type RefundStatus = 'NONE' | 'REQUESTED' | 'VERIFIED_PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED';

export interface Order {
  id: string;
  partnerId?: string;
  stripeSessionId: string;
  stripeChargeId?: string; // For refund API calls
  stripePaymentIntentId?: string;
  totalAmount: number;
  commissionEarned: number;
  customerEmail?: string;
  customerName?: string;
  status: 'COMPLETED' | 'REFUNDED' | 'FAILED';
  // Commission maturity tracking (7-day rule)
  maturityDate: string; // 8 days after createdAt
  isMatured: boolean; // Has passed the 7-day refund window
  // Refund workflow
  refundStatus: RefundStatus;
  refundRequestedAt?: string;
  refundVerifiedAt?: string;
  refundApprovedAt?: string;
  refundRejectedAt?: string;
  refundReason?: string;
  // Geo tracking
  customerCountry?: string;
  customerCity?: string;
  customerIp?: string;
  createdAt: string;
}

export type PayoutStatus = 'PENDING_APPROVAL' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REJECTED';
export type PayoutType = 'MANUAL' | 'AUTO';

export interface Payout {
  id: string;
  partnerId: string;
  amount: number;
  status: PayoutStatus;
  type: PayoutType; // Manual withdrawal vs Auto-payout
  periodStart: string;
  periodEnd: string;
  requestedAt?: string; // When partner clicked withdraw
  approvedAt?: string; // When admin approved
  paidAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

// Withdrawal Request (for manual withdrawals)
export interface WithdrawalRequest {
  id: string;
  partnerId: string;
  // Gross vs Net tracking
  amountRequested: number; // Original amount partner requested
  payoutFee: number; // $0.25 standard or higher for international
  monthlyFee: number; // $2.00 if first payout of month, else $0
  crossBorderFee: number; // FX/International fee (1%+ for non-US)
  totalFees: number; // Sum of all fees
  amountToDeposit: number; // Net amount after fees
  // Status tracking
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'FAILED';
  payoutMethod: 'STRIPE' | 'WISE' | 'CRYPTO' | 'MANUAL';
  stripeTransferId?: string; // Stripe transfer ID if paid via Stripe
  // Timestamps
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  adminNotes?: string;
  createdAt: string;
}

// Review System
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number; // 1-5
  content: string;
  country: string; // ISO country code (e.g., 'US', 'NG', 'GB')
  countryFlag: string; // Emoji flag
  device: 'mobile' | 'desktop';
  hasEmoji: boolean;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  verificationSentAt?: string;
  ipAddress?: string;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

// Support Ticket System
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'ORDER_ISSUE' | 'REFUND_REQUEST' | 'TECHNICAL_ISSUE' | 'ACCOUNT_ISSUE' | 'GENERAL_INQUIRY' | 'OTHER';

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g., "TL-2025-0001"
  name: string;
  email: string;
  category: TicketCategory;
  subject: string;
  message: string;
  orderNumber?: string; // Optional order reference
  priority: TicketPriority;
  status: TicketStatus;
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscriber/Contact System - tracks all email/phone signups by source
export type SubscriberSource = 
  | 'AUTHOR_MAILING_LIST'      // "Receive The Message" on author page
  | 'MUSIC_UPDATES'            // Music release notifications
  | 'BOOK_UPDATES'             // New book notifications
  | 'DAILY_ENCOURAGEMENT'      // Daily text/email encouragement
  | 'WEEKLY_ENCOURAGEMENT'     // Weekly text/email encouragement
  | 'PUBLISHER_INQUIRY'        // Publisher page inquiries
  | 'GENERAL_NEWSLETTER'       // General newsletter signup
  | 'OTHER';

export interface Subscriber {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  source: SubscriberSource;
  sourceDetail?: string; // Additional context (e.g., which page, campaign)
  country?: string;
  countryFlag?: string;
  ipAddress?: string;
  userAgent?: string;
  isVerified: boolean; // Email/phone verified
  verifiedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Phase 2: User (Customer) model
export interface SessionToken {
  token: string;
  deviceInfo?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  name?: string;
  activeSessions: SessionToken[]; // 2-device limit enforcement (max 2 sessions)
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

// Partner Feedback System - for testing partners to submit change requests
export type FeedbackStatus = 'NEW' | 'REVIEWED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';

export interface PartnerFeedback {
  id: string;
  feedbackNumber: string; // e.g., "FB-2026-0001"
  partnerName: string;
  partnerEmail?: string;
  pageUrl: string; // URL where feedback was submitted
  sectionName?: string; // Optional section identifier
  screenshotBase64?: string; // Base64 encoded screenshot
  rawFeedback: string; // Original unprocessed feedback (voice or text)
  aiProcessedInstructions?: string; // AI-transformed IDE-ready instructions
  status: FeedbackStatus;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  completedAt?: string;
}

// Site Settings - for admin toggles
export interface SiteSettings {
  feedbackWidgetEnabled: boolean; // Toggle to show/hide feedback widget
  feedbackWidgetUpdatedAt?: string;
}

export interface Database {
  partners: Partner[];
  events: TrackingEvent[];
  orders: Order[];
  payouts: Payout[];
  withdrawalRequests: WithdrawalRequest[];
  users: User[];
  books: DigitalBook[];
  libraryAccess: LibraryAccess[];
  reviews: Review[];
  supportTickets: SupportTicket[];
  subscribers: Subscriber[];
  partnerFeedback: PartnerFeedback[];
  siteSettings: SiteSettings;
}

export function readDb(): Database {
  if (!fs.existsSync(DB_PATH)) {
    return { partners: [], events: [], orders: [], payouts: [], withdrawalRequests: [], users: [], books: [], libraryAccess: [], reviews: [], supportTickets: [], subscribers: [], partnerFeedback: [], siteSettings: { feedbackWidgetEnabled: true } };
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const data = JSON.parse(raw);
  return {
    partners: data.partners || [],
    events: data.events || [],
    orders: data.orders || [],
    payouts: data.payouts || [],
    withdrawalRequests: data.withdrawalRequests || [],
    users: data.users || [],
    books: data.books || [],
    libraryAccess: data.libraryAccess || [],
    reviews: data.reviews || [],
    supportTickets: data.supportTickets || [],
    subscribers: data.subscribers || [],
    partnerFeedback: data.partnerFeedback || [],
    siteSettings: data.siteSettings || { feedbackWidgetEnabled: true },
  };
}

export function writeDb(data: Database) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function generateId(): string {
  return uuidv4();
}

export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
  const now = new Date();
  
  const pageViews = events.filter((e) => e.type === 'PAGE_VIEW').length;
  const amazonClicks = events.filter((e) => e.type === 'CLICK_AMAZON').length;
  const bookBabyClicks = events.filter((e) => e.type === 'CLICK_BOOKBABY').length;
  const directClicks = events.filter((e) => e.type === 'CLICK_DIRECT').length;
  
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED' && o.refundStatus !== 'APPROVED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = completedOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
  
  // Maturity logic: 7-day rule
  const maturedOrders = completedOrders.filter((o) => {
    const maturityDate = new Date(o.maturityDate || addDays(new Date(o.createdAt), 8).toISOString());
    return now >= maturityDate;
  });
  const pendingOrders = completedOrders.filter((o) => {
    const maturityDate = new Date(o.maturityDate || addDays(new Date(o.createdAt), 8).toISOString());
    return now < maturityDate;
  });
  
  const maturedCommission = maturedOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
  const pendingCommission = pendingOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
  
  const partner = getPartnerById(partnerId);
  const clickBountyEarned = (amazonClicks + bookBabyClicks) * (partner?.clickBounty || 0.10);
  
  // Calculate upcoming maturity schedule (next 30 days)
  const upcomingMaturity = pendingOrders
    .map((o) => ({
      date: o.maturityDate || addDays(new Date(o.createdAt), 8).toISOString(),
      amount: o.commissionEarned,
      orderId: o.id,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return {
    pageViews,
    amazonClicks,
    bookBabyClicks,
    directClicks,
    directSales: completedOrders.length,
    totalRevenue,
    // Total lifetime commissions earned (gross)
    totalCommission,
    liveCommissionsEarned: totalCommission + clickBountyEarned, // Gross amount
    // Maturity breakdown
    maturedCommission, // Past 7-day window, safe to pay
    pendingCommission, // Still in 7-day window
    availableForWithdrawal: maturedCommission + clickBountyEarned, // Click bounties are instant
    lockedFunds: pendingCommission, // Funds locked until Day 8
    // Click bounty (instant, no maturity)
    clickBountyEarned,
    // Legacy field for backwards compatibility
    pendingPayout: totalCommission + clickBountyEarned,
    // Maturity schedule for tooltip
    upcomingMaturity,
    conversionRate: pageViews > 0 ? ((completedOrders.length / pageViews) * 100) : 0,
  };
}

// Helper: Add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Calculate maturity date (16 days after sale)
export function calculateMaturityDate(saleDate: string): string {
  const date = new Date(saleDate);
  return addDays(date, 16).toISOString();
}

// Check if an order has matured
export function isOrderMatured(order: Order): boolean {
  const maturityDate = new Date(order.maturityDate || calculateMaturityDate(order.createdAt));
  return new Date() >= maturityDate;
}

// Get days until maturity
export function getDaysUntilMaturity(order: Order): number {
  const maturityDate = new Date(order.maturityDate || calculateMaturityDate(order.createdAt));
  const now = new Date();
  const diffMs = maturityDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
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
