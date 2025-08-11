import { NextResponse } from 'next/server';
import { broadcast } from '../../../../lib/pushServer';
import { getState, setState } from '../../../../lib/storeSupabase';
import { decideMinute, DEFAULTS } from '../../../../lib/strategy';

const TZ = 'America/Toronto';
function inWindow(d: Date) {
  const h = d.getHours(), m = d.getMinutes();
  const afterOpen  = h > 8 || (h === 8 && m >= 30);
  const beforeClose = h < 23 || (h === 23 && m === 0);
  return afterOpen && beforeClose;
}
function fmt(d: Date){ return d.toLocaleString('en-CA', { hour12: true, timeZone: TZ }); }

async function fetchData() {
  const [uniCad, uniUsd, btc] = await Promise.all([
    fetch('https://api.coingecko.com/api/v3/coins/uniswap/market_chart?vs_currency=cad&days=1&interval=hourly', { cache:'no-store' }).then(r=>r.json()),
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=uniswap&vs_currencies=usd', { cache:'no-store' }).then(r=>r.json()),
    fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly', { cache:'no-store' }).then(r=>r.json()),
  ]);
  const cadSeries = (uniCad?.prices || []).map((p: [number,number]) => p[1]).filter(Boolean);
  const uniUsdNow = uniUsd?.uniswap?.usd ?? null;
  const btcPrices: [number,number][] = btc?.prices || [];
  let btcSlope = 0;
  if (btcPrices.length >= 2) {
    const first = btcPrices[0][1], last = btcPrices.at(-1)![1];
    btcSlope = ((last - first) / first) * 100;
  }
  const uniNowCad = cadSeries.at(-1) ?? null;
  return { cadSeries, uniNowCad, uniUsdNow, btcSlope };
}

export async function GET() {
  const now = new Date();
  if (!inWindow(now)) return NextResponse.json({ skipped:'outside window', now: fmt(now) });

  const keyDay = now.toISOString().slice(0,10); // YYYY-MM-DD
  const lastMeta = await getState<{ ts:number; action:string; sentOpen?:1 }>(`lastMeta:${keyDay}`);

  const { cadSeries, uniNowCad, uniUsdNow, btcSlope } = await fetchData();
  if (!cadSeries?.length || !uniNowCad || !uniUsdNow) return new NextResponse('no price data', { status: 500 });

  const d = decideMinute(cadSeries, uniNowCad, uniUsdNow, btcSlope, DEFAULTS);

  const atOpenMinute = now.getHours() === 8 && now.getMinutes() === 30;
  const lastTs = lastMeta?.ts ?? 0;
  const lastAction = lastMeta?.action ?? 'HOLD';
  const minutesSince = lastTs ? (Date.now() - lastTs) / 60000 : Infinity;
  const actionChanged = d.action !== lastAction;
  const shouldSend = (atOpenMinute && !lastMeta?.sentOpen) || actionChanged || minutesSince >= DEFAULTS.minMinutesBetweenAlerts;

  if (!shouldSend) return NextResponse.json({ hold:true, minutesSince, actionChanged, now: fmt(now) });

  const title = `Signal: ${d.action}`;
  const body  = `${d.action}${d.suggestUsd ? ` $${d.suggestUsd}` : ''} — ${d.note}`;
  const res = await broadcast(title, body);

  await setState(`lastMeta:${keyDay}`, { ts: Date.now(), action: d.action, sentOpen: (atOpenMinute ? 1 : (lastMeta?.sentOpen ? 1 : undefined)) });

  return NextResponse.json({ sent: res.sent, total: res.total, title, body, now: fmt(now) });
}
