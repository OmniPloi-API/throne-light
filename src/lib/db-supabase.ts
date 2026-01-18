/**
 * Supabase Database Layer
 * Persistent storage for all business-critical data
 * Replaces the ephemeral JSON file database
 */

import { getSupabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Re-export types from the original db.ts for compatibility
export type PartnerType = 'REV_SHARE' | 'FLAT_FEE';

export interface Partner {
  id: string;
  name: string;
  email: string;
  password?: string;
  slug: string;
  couponCode: string;
  accessCode?: string;
  amazonUrl?: string;
  kindleUrl?: string;
  bookBabyUrl?: string;
  commissionPercent: number;
  clickBounty: number;
  discountPercent: number;
  partnerType: PartnerType;
  autoWithdrawEnabled: boolean;
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  taxFormVerified: boolean;
  country: string;
  payoutMethod: 'STRIPE' | 'WISE' | 'CRYPTO' | 'MANUAL';
  wiseEmail?: string;
  cryptoWallet?: string;
  lastPayoutMonth?: string;
  isActive: boolean;
  deactivatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  partnerId: string;
  type: 'PAGE_VIEW' | 'CLICK_AMAZON' | 'CLICK_KINDLE' | 'CLICK_BOOKBABY' | 'CLICK_DIRECT' | 'PENDING_SALE' | 'SALE';
  subLinkId?: string;
  teamMemberId?: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  device?: string;
  pagePath?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  partnerId?: string;
  stripeSessionId: string;
  stripeChargeId?: string;
  stripePaymentIntentId?: string;
  totalAmount: number;
  commissionEarned: number;
  customerEmail?: string;
  customerName?: string;
  status: 'COMPLETED' | 'REFUNDED' | 'FAILED';
  maturityDate: string;
  isMatured: boolean;
  refundStatus: 'NONE' | 'REQUESTED' | 'VERIFIED_PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
  refundRequestedAt?: string;
  refundVerifiedAt?: string;
  refundApprovedAt?: string;
  refundRejectedAt?: string;
  refundReason?: string;
  customerCountry?: string;
  customerCity?: string;
  customerIp?: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  source: string;
  sourceDetail?: string;
  country?: string;
  countryFlag?: string;
  ipAddress?: string;
  userAgent?: string;
  isVerified: boolean;
  verifiedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  content: string;
  country: string;
  countryFlag: string;
  device: 'mobile' | 'desktop';
  hasEmoji: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerifiedPurchase: boolean;
  verificationSentAt?: string;
  ipAddress?: string;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  orderNumber?: string;
  priority: string;
  status: string;
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to convert snake_case DB rows to camelCase
function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

// Helper to convert camelCase to snake_case for DB
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// Generate ID
export function generateId(): string {
  return uuidv4();
}

// ============================================
// PARTNERS
// ============================================

export async function getPartners(): Promise<Partner[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
  
  return (data || []).map(row => toCamelCase(row) as unknown as Partner);
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return toCamelCase(data) as unknown as Partner;
}

export async function getPartnerBySlug(slug: string): Promise<Partner | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return toCamelCase(data) as unknown as Partner;
}

export async function getPartnerByEmail(email: string): Promise<Partner | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return toCamelCase(data) as unknown as Partner;
}

export async function createPartner(partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Partner> {
  const supabase = getSupabaseAdmin();
  const id = generateId();
  const now = new Date().toISOString();
  
  const newPartner = {
    id,
    ...toSnakeCase(partner as unknown as Record<string, unknown>),
    created_at: now,
    updated_at: now,
  };
  
  const { data, error } = await supabase
    .from('partners')
    .insert(newPartner)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating partner:', error);
    throw error;
  }
  
  return toCamelCase(data) as unknown as Partner;
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | null> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('partners')
    .update({
      ...toSnakeCase(updates as unknown as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating partner:', error);
    return null;
  }
  
  return toCamelCase(data) as unknown as Partner;
}

export async function deletePartner(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);
  
  return !error;
}

// ============================================
// TRACKING EVENTS
// ============================================

export async function getEvents(partnerId?: string): Promise<TrackingEvent[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('tracking_events')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return (data || []).map(row => ({
    ...toCamelCase(row),
    type: row.event_type,
  }) as unknown as TrackingEvent);
}

export async function createEvent(event: Omit<TrackingEvent, 'id' | 'createdAt'>): Promise<TrackingEvent> {
  const supabase = getSupabaseAdmin();
  const id = generateId();
  const now = new Date().toISOString();
  
  const newEvent = {
    id,
    partner_id: event.partnerId,
    sub_link_id: event.subLinkId,
    team_member_id: event.teamMemberId,
    event_type: event.type,
    ip_address: event.ipAddress,
    user_agent: event.userAgent,
    country: event.country,
    city: event.city,
    device: event.device,
    page_path: event.pagePath,
    created_at: now,
  };
  
  const { data, error } = await supabase
    .from('tracking_events')
    .insert(newEvent)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }
  
  return {
    ...toCamelCase(data),
    type: data.event_type,
  } as unknown as TrackingEvent;
}

// Convert PENDING_SALE to SALE for a partner (used by webhook after successful payment)
export async function convertPendingSaleToSale(partnerId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  // Find the most recent PENDING_SALE for this partner (within last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: pendingEvents, error: findError } = await supabase
    .from('tracking_events')
    .select('id')
    .eq('partner_id', partnerId)
    .eq('event_type', 'PENDING_SALE')
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (findError || !pendingEvents || pendingEvents.length === 0) {
    return false;
  }
  
  // Update to SALE
  const { error: updateError } = await supabase
    .from('tracking_events')
    .update({ event_type: 'SALE' })
    .eq('id', pendingEvents[0].id);
  
  if (updateError) {
    console.error('Error converting pending sale to sale:', updateError);
    return false;
  }
  
  return true;
}

export async function getEventStats(partnerId?: string): Promise<{
  pageViews: number;
  amazonClicks: number;
  directClicks: number;
  sales: number;
}> {
  const supabase = getSupabaseAdmin();
  
  let query = supabase.from('tracking_events').select('event_type');
  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching event stats:', error);
    return { pageViews: 0, amazonClicks: 0, directClicks: 0, sales: 0 };
  }
  
  const events = data || [];
  return {
    pageViews: events.filter(e => e.event_type === 'PAGE_VIEW').length,
    amazonClicks: events.filter(e => e.event_type === 'CLICK_AMAZON').length,
    directClicks: events.filter(e => e.event_type === 'CLICK_DIRECT').length,
    sales: events.filter(e => e.event_type === 'SALE').length,
  };
}

// ============================================
// ORDERS
// ============================================

export async function getOrders(partnerId?: string): Promise<Order[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return (data || []).map(row => toCamelCase(row) as unknown as Order);
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const supabase = getSupabaseAdmin();
  const id = generateId();
  const now = new Date().toISOString();
  
  const newOrder = {
    id,
    ...toSnakeCase(order as unknown as Record<string, unknown>),
    created_at: now,
  };
  
  const { data, error } = await supabase
    .from('orders')
    .insert(newOrder)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return toCamelCase(data) as unknown as Order;
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return toCamelCase(data) as unknown as Order;
}

// ============================================
// SUBSCRIBERS
// ============================================

export async function getSubscribers(): Promise<Subscriber[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
  
  return (data || []).map(row => toCamelCase(row) as unknown as Subscriber);
}

export async function createSubscriber(subscriber: Omit<Subscriber, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscriber> {
  const supabase = getSupabaseAdmin();
  const id = generateId();
  const now = new Date().toISOString();
  
  const newSubscriber = {
    id,
    ...toSnakeCase(subscriber as unknown as Record<string, unknown>),
    created_at: now,
    updated_at: now,
  };
  
  const { data, error } = await supabase
    .from('subscribers')
    .insert(newSubscriber)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating subscriber:', error);
    throw error;
  }
  
  return toCamelCase(data) as unknown as Subscriber;
}

export async function getSubscriberByEmailAndSource(email: string, source: string): Promise<Subscriber | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('source', source)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return toCamelCase(data) as unknown as Subscriber;
}

export async function getSubscribersBySource(source: string): Promise<Subscriber[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('source', source)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching subscribers by source:', error);
    return [];
  }
  
  return (data || []).map(row => toCamelCase(row) as unknown as Subscriber);
}

export async function updateSubscriber(id: string, updates: Partial<Subscriber>): Promise<Subscriber | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscribers')
    .update({
      ...toSnakeCase(updates as unknown as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subscriber:', error);
    return null;
  }
  
  return toCamelCase(data) as unknown as Subscriber;
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subscriber:', error);
    return false;
  }
  
  return true;
}

export async function getSubscriberStats(): Promise<{ total: number; bySource: Record<string, number> }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscribers')
    .select('source');
  
  if (error) {
    console.error('Error fetching subscriber stats:', error);
    return { total: 0, bySource: {} };
  }
  
  const bySource: Record<string, number> = {};
  (data || []).forEach((row: { source: string }) => {
    bySource[row.source] = (bySource[row.source] || 0) + 1;
  });
  
  return { total: data?.length || 0, bySource };
}

// ============================================
// REVIEWS
// ============================================

export async function getReviews(status?: string): Promise<Review[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  
  return (data || []).map(row => toCamelCase(row) as unknown as Review);
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const supabase = getSupabaseAdmin();
  const id = generateId();
  const now = new Date().toISOString();
  
  const newReview = {
    id,
    ...toSnakeCase(review as unknown as Record<string, unknown>),
    created_at: now,
  };
  
  const { data, error } = await supabase
    .from('reviews')
    .insert(newReview)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }
  
  return toCamelCase(data) as unknown as Review;
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('reviews')
    .update(toSnakeCase(updates as unknown as Record<string, unknown>))
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating review:', error);
    return null;
  }
  
  return toCamelCase(data) as unknown as Review;
}

// ============================================
// SUPPORT TICKETS
// ============================================

export async function getSupportTickets(status?: string): Promise<SupportTicket[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching support tickets:', error);
    return [];
  }
  
  return (data || []).map(row => toCamelCase(row) as unknown as SupportTicket);
}

export async function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
  const supabase = getSupabaseAdmin();
  const id = generateId();
  const now = new Date().toISOString();
  
  const newTicket = {
    id,
    ...toSnakeCase(ticket as unknown as Record<string, unknown>),
    created_at: now,
    updated_at: now,
  };
  
  const { data, error } = await supabase
    .from('support_tickets')
    .insert(newTicket)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
  
  return toCamelCase(data) as unknown as SupportTicket;
}

export async function updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      ...toSnakeCase(updates as unknown as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating support ticket:', error);
    return null;
  }
  
  return toCamelCase(data) as unknown as SupportTicket;
}

// ============================================
// GLOBAL ANALYTICS
// ============================================

export async function getGlobalAnalytics(): Promise<{
  totalPageViews: number;
  totalAmazonClicks: number;
  totalDirectClicks: number;
  totalSales: number;
  totalRevenue: number;
  totalSubscribers: number;
  totalReviews: number;
  averageRating: number;
}> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('global_analytics')
    .select('*')
    .single();
  
  if (error || !data) {
    console.error('Error fetching global analytics:', error);
    return {
      totalPageViews: 0,
      totalAmazonClicks: 0,
      totalDirectClicks: 0,
      totalSales: 0,
      totalRevenue: 0,
      totalSubscribers: 0,
      totalReviews: 0,
      averageRating: 0,
    };
  }
  
  return {
    totalPageViews: data.total_page_views || 0,
    totalAmazonClicks: data.total_amazon_clicks || 0,
    totalDirectClicks: data.total_direct_clicks || 0,
    totalSales: data.total_sales || 0,
    totalRevenue: data.total_revenue || 0,
    totalSubscribers: data.total_subscribers || 0,
    totalReviews: data.total_reviews || 0,
    averageRating: data.average_rating || 0,
  };
}
