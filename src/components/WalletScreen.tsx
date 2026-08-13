'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { fmtBio, fmtUsd, shortAddr } from '@/lib/utils'
import { haptic } from '@/lib/telegram'
import { WalletConnectModal } from './WalletConnectModal'
import { WithdrawModal } from './WithdrawModal'
import type { Wallet, AppState } from '@/types'

const WALLET_COLOR: Record<string, string> = {
  trust_wallet: '#3375BB', binance: '#F0B90B', bitget: '#00F0FF', bingx: '#1652F0',
}

export function WalletScreen({ state }: { state: AppState }) {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [editing, setEditing] = useState<Wallet | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const load = () => api.getWallets().then(d => setWallets(d.wallets)).catch(() => {})
  useEffect(() => { load() }, [])

  const trustWallet = wallets.find(w => w.id === 'trust_wallet')

  return (
    <div style={{ padding: '24px 20px 100px', minHeight: '100dvh' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800, fontSize: 28, letterSpacing: 1, marginBottom: 24 }}>WALLET</h1>

      <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Total Balance</p>
        <p style={{ fontSize: 36, fontWeight: 800 }}>{fmtBio(state.bio_balance)} <span style={{ color: 'var(--gold)' }}>BIO</span></p>
        <p style={{ color: '#22c55e', fontSize: 14, marginTop: 4 }}>≈ {fmtUsd(state.bio_balance * state.bio_price_usd)}</p>
      </div>

      <button onClick={() => { haptic(); setWithdrawOpen(true) }} className="gold-btn" style={{ width: '100%', padding: 18, fontSize: 16, marginBottom: 24 }}>
        ↑ Withdraw BIO
      </button>

      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>Your wallets</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {wallets.map(w => (
          <div key={w.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: WALLET_COLOR[w.id] || '#555', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>
              {w.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{w.name}</p>
              {w.address && <p className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{shortAddr(w.address)}</p>}
            </div>
            <button onClick={() => setEditing(w)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {w.address ? 'Edit' : 'Connect →'}
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <WalletConnectModal wallet={editing} onClose={() => setEditing(null)} onSaved={setWallets} />
      )}
      {withdrawOpen && (
        <WithdrawModal onClose={() => setWithdrawOpen(false)} address={trustWallet?.address ?? null} />
      )}
    </div>
  )
}
