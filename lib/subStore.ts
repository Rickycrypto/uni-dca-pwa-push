// lib/subStore.ts
type PushSub = { endpoint: string } & any;

const subs: PushSub[] = [];

export function addSub(sub: PushSub) {
  if (!sub?.endpoint) return;
  if (!subs.find((s) => s.endpoint === sub.endpoint)) subs.push(sub);
}

export function getSubs() {
  return subs;
}
