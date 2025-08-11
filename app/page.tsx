
'use client';

import React, { useEffect, useState } from 'react'
import { subscribePush } from '../lib/push'
import { nextExecutionWindow } from '../lib/schedule'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export default function Page() {
  const [status, setStatus] = useState('')
  const [preHours, setPreHours] = useState(3)
  const [nextPre, setNextPre] = useState<Date|null>(null)
  const [nextExec, setNextExec] = useState<Date|null>(null)

  useEffect(()=>{
    const { exec, pre } = nextExecutionWindow(new Date(), 0, preHours)
    setNextPre(pre)
    setNextExec(exec)
  }, [preHours])

  async function enablePush() {
    try {
      await subscribePush(VAPID_PUBLIC)
      setStatus('Push notifications enabled ✅')
    } catch (e:any) {
      setStatus('Enable failed: ' + (e?.message || String(e)))
    }
  }

  async function testPush() {
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-broadcast-key': (process.env.NEXT_PUBLIC_BROADCAST_KEY || '') },
      body: JSON.stringify({ title: 'Test Trade Alert', body: 'This is a test notification.' })
    })
    setStatus(res.ok ? 'Test sent (if subscribed)' : 'Broadcast failed')
  }

  return (
    <div style={{ maxWidth: 840, margin: '16px auto', padding: 16 }}>
      <h1>UNI DCA Trader</h1>
      <p>Pre-alert hours: 
        <input type="number" value={preHours} onChange={e=>setPreHours(parseInt(e.target.value||'0')||0)} style={{ width: 60, marginLeft: 8 }} /> 
      </p>
      <p>Next pre-alert: <b>{nextPre?.toLocaleString() || '-'}</b><br/>
         Next execution window: <b>{nextExec?.toLocaleString() || '-'}</b></p>

      <div style={{ display:'flex', gap: 12, marginTop: 12 }}>
        <button onClick={enablePush}>Enable Push</button>
        <button onClick={testPush}>Send Test</button>
      </div>
      <p style={{ marginTop: 12, color: '#555' }}>{status}</p>
      <hr style={{ margin: '20px 0' }}/>
      <p>Keep Safari open in the background for iPhone PWA push reliability. Install via Safari → Share → Add to Home Screen.</p>
    </div>
  )
}
