import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function readDb() {
  if (!fs.existsSync(DB_PATH)) return { coupons: [], partners: [], sales: [] };
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data: any) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const { code } = params;
  const db = readDb();
  const coupon = db.coupons.find((c: any) => c.code === code);
  if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

  coupon.clicks = (coupon.clicks || 0) + 1;
  writeDb(db);
  return NextResponse.json({ clicks: coupon.clicks });
}
