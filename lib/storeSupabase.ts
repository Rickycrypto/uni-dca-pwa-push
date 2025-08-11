// lib/storeSupabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function getState<T=any>(id: string): Promise<T|null> {
  const { data } = await supabase.from('bot_state').select('value').eq('id', id).single();
  return (data?.value ?? null) as T | null;
}

export async function setState(id: string, value: any) {
  await supabase.from('bot_state').upsert({ id, value }, { onConflict: 'id' });
}
