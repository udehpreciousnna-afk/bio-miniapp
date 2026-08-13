'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { hapticSuccess, hapticError } from '@/lib/telegram'
import type { Wallet } from '@/types'

export function WalletConnectModal({ wallet, onClose, onSaved }: {
  wallet: Wallet; onClose: () => void; onSaved: (wallets: Wallet[]) => void
}) {
  const [address, setAddress] = useState(wallet.address || '')
  const [saving, setSaving] = useState(false)
  const editing = !!wallet.address

  const save = async () => {
    if (!address.trim()) return
    setSaving(true)
    try {
      const res = await api.connectWallet(wallet.id, address.trim())
      if (res.success) { onSaved(res.wallets); hapticSuccess(); onClose() }
    } catch { hapticError() }
    setSaving(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 50,
        width: 'min(92vw, 420px)', background: '#0d0e14', border: '1px solid rgba(242,185,12,0.2)',
        borderRadius: 22, padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 20 }}>{wallet.name}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{editing ? 'Edit your address' : 'Connect your wallet'}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}><X size={15} /></button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
          Submit your BIO wallet address from {wallet.name}
        </p>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter or paste wallet address"
          className="mono"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, marginBottom: 18, outline: 'none' }}
        />
        <button onClick={save} disabled={saving || !address.trim()} className="gold-btn" style={{ width: '100%', padding: 16, fontSize: 15, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : editing ? 'Update Wallet' : 'Connect Wallet'}
        </button>
      </div>
    </>
  )
}
