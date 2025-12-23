import { NextResponse } from 'next/server';
import { getAllStats } from '@/lib/db';

export async function GET() {
  const stats = getAllStats();
  return NextResponse.json(stats);
}
