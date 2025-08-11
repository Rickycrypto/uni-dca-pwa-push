
import { NextResponse } from 'next/server'

// naive in-memory store (for demo only). For production, replace with Vercel KV/Upstash or your DB.
const subs: any[] = []

export async function POST(req: Request) {
  const body = await req.json()
  // avoid duplicates by endpoint
  const exists = subs.find((s) => s?.endpoint === body?.endpoint)
  if (!exists) subs.push(body)
  return NextResponse.json({ ok: true })
}

// Helper for broadcast module
export function getSubs() {
  return subs
}
