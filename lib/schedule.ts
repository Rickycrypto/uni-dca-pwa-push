
export function nextExecutionWindow(now: Date, tzOffsetMinutes: number, preAlertHours: number) {
  // Market window 08:30–23:00 local (Toronto UTC-4/-5 depending DST). We'll use client local time for simplicity.
  function setHM(d: Date, h: number, m: number) {
    const x = new Date(d)
    x.setHours(h, m, 0, 0)
    return x
  }
  const open = setHM(now, 8, 30)
  const close = setHM(now, 23, 0)

  let exec = new Date(now.getTime() + preAlertHours*3600*1000)
  exec.setMinutes(0,0,0)
  if (exec < open) exec = open
  if (exec > close) {
    // next day at open
    exec = new Date(open.getTime() + 24*3600*1000)
  }
  const pre = new Date(exec.getTime() - preAlertHours*3600*1000)
  return { exec, pre }
}
