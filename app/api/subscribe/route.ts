import { NextResponse } from 'next/server';
import { addSub } from '../../../lib/subStore';

export async function POST(req: Request) {
  const body = await req.json();
  addSub(body);
  return NextResponse.json({ ok: true });
}

