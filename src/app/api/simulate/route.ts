import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function readDb() {
  if (!fs.existsSync(DB_PATH)) return { coupons: [], partners: [], sales: [] };
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data: any) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const { couponCode, amount = 19.99, platform = 'stripe' } = await req.json();
  if (!couponCode) {
    return NextResponse.json({ error: 'Missing couponCode' }, { status: 400 });
  }
  const db = readDb();
  const coupon = db.coupons.find((c: any) => c.code === couponCode);
  if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });

  const partner = db.partners.find((p: any) => p.id === coupon.partnerId);
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

  const commissionRate = coupon.commissionPercent ?? partner.defaultCommissionPercent;
  const commission = (amount * commissionRate) / 100;

  const sale = {
    id: uuidv4(),
    couponCode,
    partnerId: coupon.partnerId,
    amount,
    currency: 'USD',
    commission,
    commissionRate,
    platform,
    createdAt: new Date().toISOString(),
  };

  db.sales.push(sale);
  coupon.usageCount = (coupon.usageCount || 0) + 1;
  writeDb(db);
  return NextResponse.json(sale, { status: 201 });
}
