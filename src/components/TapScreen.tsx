'use client'
import { useEffect, useRef, useState } from 'react'
import { Zap, Hourglass } from 'lucide-react'
import { BioIcon } from './BioIcon'
import { api } from '@/lib/api'
import { haptic, hapticError } from '@/lib/telegram'
import { fmtBio, fmtUsd, fmtCountdown } from '@/lib/utils'
import type { AppState } from '@/types'

const ENERGY_REFILL_HOURS = 2 // full 0 → max regen time

export function TapScreen({ state, setState, userName }: {
  state: AppState; setState: (s: AppState) => void; userName: string
}) {
  const [floats, setFloats] = useState<{ id: number; x: number; y: number }[]>([])
  const floatId = useRef(0)
  const pending = useRef(0) // taps sent to server but not yet confirmed
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Local countdown ticks every second between server syncs
  useEffect(() => {
    const iv = setInterval(() => {
      setState({
        ...state,
        energy_refill_seconds: Math.max(0, state.energy_refill_seconds - 1),
        energy: state.energy >= state.energy_max
          ? state.energy_max
          : Math.min(state.energy_max, state.energy + state.energy_max / (ENERGY_REFILL_HOURS * 3600)),
      })
    }, 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.energy_refill_seconds])

  const flushTaps = () => {
    if (pending.current <= 0) return
    const n = pending.current
    pending.current = 0
    api.tap(n).then(res => {
      setState({ ...state, bio_balance: res.bio_balance, energy: res.energy, energy_refill_seconds: res.energy_refill_seconds })
    }).catch(() => { hapticError() })
  }

  const handleTap = (e: React.MouseEvent) => {
    if (state.energy < 1) { hapticError(); return }
    haptic('light')

    // Optimistic local update for instant feedback
    setState({ ...state, bio_balance: state.bio_balance + 1, energy: state.energy - 1 })

    const id = floatId.current++
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setFloats(f => [...f, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 900)

    pending.current += 1
    if (flushTimer.current) clearTimeout(flushTimer.current)
    flushTimer.current = setTimeout(flushTaps, 400)
  }

  const energyPct = Math.min(100, (state.energy / state.energy_max) * 100)
  const usdValue = state.bio_balance * state.bio_price_usd

  return (
    <div style={{ padding: '20px 20px 100px', minHeight: '100dvh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: 'rgba(242,185,12,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--gold)',
          }}>{userName.charAt(0).toUpperCase() || '?'}</div>
          <span style={{ fontWeight: 700 }}>{userName} ⛏️</span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 800 }}>
          {fmtBio(state.bio_balance)} <span style={{ color: 'var(--gold)' }}>BIO</span>
        </div>
        <div style={{ color: '#22c55e', fontSize: 15, marginTop: 4 }}>≈ {fmtUsd(usdValue)}</div>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '48px 0 36px' }}>
        <button
          onClick={handleTap}
          className="tap-pulse"
          style={{
            width: 260, height: 260, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'radial-gradient(circle at 35% 30%, #ffe27a, #f2b90c 55%, #b8860b 100%)',
            boxShadow: '0 0 60px rgba(242,185,12,0.45), inset 0 -8px 20px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ width: '70%', height: '70%', margin: '0 auto' }}>
            <img src="/bio-logo.jpg" alt="BIO" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
        </button>
        {floats.map(f => (
          <div key={f.id} className="float-reward" style={{
            position: 'absolute', left: f.x + 40, top: f.y, fontWeight: 800, fontSize: 22, color: 'var(--gold)',
          }}>+1</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
          <Zap size={18} color="var(--gold)" fill="var(--gold)" />
          <span className="mono" style={{ fontWeight: 700 }}>{Math.floor(state.energy)}/{state.energy_max}</span>
        </div>
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
          <Hourglass size={18} color="var(--gold)" />
          <span className="mono" style={{ fontWeight: 700 }}>{fmtCountdown(state.energy_refill_seconds)}</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${energyPct}%`, height: '100%', background: 'linear-gradient(90deg, #ffd23f, var(--gold))', transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}
