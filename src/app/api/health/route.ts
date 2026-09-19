import { NextResponse } from 'next/server';
import { checkAtlasConnection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkAtlasConnection();
  return NextResponse.json(status);
}
