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

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.coupons);
}

export async function POST(req: NextRequest) {
  const { code, partnerId, discountPercent, commissionPercent } = await req.json();
  if (!code || !partnerId) {
    return NextResponse.json({ error: 'Missing code or partnerId' }, { status: 400 });
  }
  const db = readDb();
  const existing = db.coupons.find((c: any) => c.code === code);
  if (existing) return NextResponse.json({ error: 'Coupon code exists' }, { status: 409 });

  const coupon = {
    id: uuidv4(),
    code,
    partnerId,
    discountPercent,
    commissionPercent,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    clicks: 0,
  };
  db.coupons.push(coupon);
  writeDb(db);
  return NextResponse.json(coupon, { status: 201 });
}
