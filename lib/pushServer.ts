import webpush from 'web-push';
import { getSubs } from './subStore';

const PUB = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const PRIV = process.env.VAPID_PRIVATE_KEY || '';

if (PUB && PRIV) {
  webpush.setVapidDetails('mailto:admin@example.com', PUB, PRIV);
}

export async function broadcast(title: string, body: string) {
  const subs = getSubs?.() ?? [];
  if (!PUB || !PRIV || subs.length === 0) return { sent: 0, total: subs.length };
  const payload = JSON.stringify({ title, body });
  const results = await Promise.allSettled(subs.map((s:any) => webpush.sendNotification(s, payload)));
  const sent = results.filter(r => r.status === 'fulfilled').length;
  return { sent, total: subs.length };
}
