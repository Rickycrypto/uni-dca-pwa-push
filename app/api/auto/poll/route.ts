import { NextResponse } from 'next/server';
import { broadcast } from '../../../../lib/pushServer';
import { getState, setState } from '../../../../lib/storeSupabase';
import { decideMinute, DEFAULTS } from '../../../../lib/strategy';

export async function GET() {
  // your logic here
  await broadcast('Cron job executed');
  return NextResponse.json({ ok: true });
}
