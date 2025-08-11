
import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { getSubs } from '../subscribe/route'

export async function POST(req: Request) {
  const key = process.env.BROADCAST_KEY || ''
  const provided = req.headers.get('x-broadcast-key') || ''
  if (!key || provided !== key) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { title, body } = await req.json()
  const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return new NextResponse('VAPID keys not set', { status: 500 })
  }

  webpush.setVapidDetails('mailto:admin@example.com', VAPID_PUBLIC, VAPID_PRIVATE)

  const subs = getSubs()
  const payload = JSON.stringify({ title: title || 'Trade Alert', body: body || '' })
  const results = await Promise.allSettled(subs.map(s => webpush.sendNotification(s, payload)))
  const ok = results.filter(r => r.status === 'fulfilled').length

  return NextResponse.json({ sent: ok, total: subs.length })
}
