'use client'
import { useEffect, useState } from 'react'
import { BottomNav, type Tab } from '@/components/BottomNav'
import { TapScreen } from '@/components/TapScreen'
import { TaskScreen } from '@/components/TaskScreen'
import { WalletScreen } from '@/components/WalletScreen'
import { ReferralScreen } from '@/components/ReferralScreen'
import { api } from '@/lib/api'
import { initTelegramApp, getTelegramUser } from '@/lib/telegram'
import type { AppState } from '@/types'

export default function Home() {
  const [tab, setTab] = useState<Tab>('tap')
  const [state, setState] = useState<AppState | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    initTelegramApp()
    api.getState().then(setState).catch(e => setError(e.message || 'Unable to load'))
  }, [])

  // Keep BIO price fresh even while sitting on the Tap screen
  useEffect(() => {
    const iv = setInterval(() => {
      api.getState().then(s => setState(prev => prev ? { ...prev, bio_price_usd: s.bio_price_usd } : s)).catch(() => {})
    }, 60_000)
    return () => clearInterval(iv)
  }, [])

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Unable to Load</p>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  if (!state) {
    return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-dim)' }}>Loading…</p></div>
  }

  const userName = getTelegramUser()?.first_name || state.user.name || 'Miner'

  return (
    <>
      {tab === 'tap' && <TapScreen state={state} setState={setState} userName={userName} />}
      {tab === 'task' && <TaskScreen />}
      {tab === 'wallet' && <WalletScreen state={state} />}
      {tab === 'refer' && <ReferralScreen />}
      <BottomNav tab={tab} onChange={setTab} />
    </>
  )
}
