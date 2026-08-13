'use client'
import { useEffect, useState } from 'react'
import { Send, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { openLink, haptic, hapticSuccess, hapticError } from '@/lib/telegram'
import { fmtBio, fmtEth } from '@/lib/utils'
import type { Task } from '@/types'

function TaskIcon({ icon }: { icon: Task['icon'] }) {
  if (icon === 'twitter') return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>𝕏</div>
  )
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#229ED9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Send size={20} color="#fff" />
    </div>
  )
}

export function TaskScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [claiming, setClaiming] = useState<string | null>(null)

  const load = () => api.getTasks().then(d => setTasks(d.tasks)).catch(() => {})
  useEffect(() => { load() }, [])

  const handleStart = (t: Task) => {
    haptic()
    openLink(t.url)
    // Optimistically flip start → claim once they've been sent to the link;
    // your backend can instead verify real membership via getChatMember
    // and this will just get overwritten on next load() with the truth.
    setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: 'claim' } : x))
  }

  const handleClaim = async (t: Task) => {
    setClaiming(t.id)
    try {
      const res = await api.claimTask(t.id)
      if (res.success) {
        setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: 'done' } : x))
        hapticSuccess()
      }
    } catch { hapticError() }
    setClaiming(null)
  }

  return (
    <div style={{ padding: '24px 20px 100px', minHeight: '100dvh' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800, fontSize: 28, letterSpacing: 1, marginBottom: 28 }}>TASKS</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tasks.map(t => (
          <div key={t.id} className="card" style={{
            padding: 16, display: 'flex', alignItems: 'center', gap: 14,
            borderColor: t.status === 'done' ? 'rgba(34,197,94,0.35)' : 'var(--card-border)',
            background: t.status === 'done' ? 'rgba(34,197,94,0.06)' : 'var(--card)',
          }}>
            <TaskIcon icon={t.icon} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{t.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 6px' }}>{t.handle}</p>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: 'var(--gold)' }}>+{fmtBio(t.reward_bio)} BIO</span>
                <span style={{ color: '#a78bfa' }}>+{fmtEth(t.reward_eth)} ETH</span>
              </div>
            </div>
            {t.status === 'start' && (
              <button onClick={() => handleStart(t)} className="gold-btn" style={{ padding: '10px 20px', fontSize: 14 }}>Start</button>
            )}
            {t.status === 'claim' && (
              <button onClick={() => handleClaim(t)} disabled={claiming === t.id} style={{
                padding: '10px 20px', borderRadius: 16, border: 'none', cursor: 'pointer',
                background: '#22c55e', color: '#052e16', fontWeight: 800, fontSize: 14,
                opacity: claiming === t.id ? 0.7 : 1,
              }}>{claiming === t.id ? '...' : 'Claim'}</button>
            )}
            {t.status === 'done' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontWeight: 700, fontSize: 14 }}>
                <Check size={16} /> Done
              </div>
            )}
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginTop: 28, lineHeight: 1.6 }}>
        Complete tasks to earn BIO &amp; ETH. Rewards are credited instantly.
      </p>
    </div>
  )
}
