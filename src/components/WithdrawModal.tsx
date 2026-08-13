'use client'
import { useEffect, useState } from 'react'
import { X, ShieldCheck, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { hapticSuccess, hapticError } from '@/lib/telegram'
import type { WithdrawEligibility } from '@/types'

export function WithdrawModal({ onClose, address }: { onClose: () => void; address: string | null }) {
  const [elig, setElig] = useState<WithdrawEligibility | null>(null)
  const [addr, setAddr] = useState(address || '')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { api.getWithdrawEligibility().then(setElig).catch(() => {}) }, [])

  const submit = async () => {
    if (!addr.trim()) return
    setSubmitting(true)
    try {
      const res = await api.withdrawBio(addr.trim())
      if (res.success) { setDone(true); hapticSuccess() }
    } catch { hapticError() }
    setSubmitting(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 50,
        width: 'min(92vw, 440px)', background: '#0d0e14', border: '1px solid rgba(242,185,12,0.2)',
        borderRadius: 22, padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, fontSize: 20 }}>Withdraw BIO</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}><X size={15} /></button>
        </div>

        {!elig && <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Checking eligibility…</p>}

        {elig && !elig.eligible && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Users size={20} color="var(--gold)" />
              <p style={{ fontWeight: 700, fontSize: 15 }}>
                {elig.referrals_current}/{elig.referrals_required} referrals
              </p>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              You need a minimum of <strong style={{ color: '#fff' }}>{elig.referrals_required} referrals</strong> to
              qualify for withdrawal. Invite {elig.referrals_required - elig.referrals_current} more friend
              {elig.referrals_required - elig.referrals_current === 1 ? '' : 's'} to unlock it.
            </p>
          </div>
        )}

        {elig && elig.eligible && !done && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 16 }}>
              <ShieldCheck size={20} color="#22c55e" />
              <div>
                <p style={{ fontWeight: 700, color: '#22c55e', fontSize: 14 }}>You&apos;re qualified for withdrawal!</p>
                <p style={{ fontSize: 12, color: 'rgba(134,239,172,0.7)', marginTop: 2 }}>
                  Airdrop distribution date: <strong>{elig.airdrop_date}</strong>
                </p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Destination address
            </p>
            <input
              value={addr}
              onChange={e => setAddr(e.target.value)}
              placeholder="0x..."
              className="mono"
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, marginBottom: 16, outline: 'none' }}
            />
            <button onClick={submit} disabled={submitting || !addr.trim()} className="gold-btn" style={{ width: '100%', padding: 16, fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting…' : 'Confirm Withdrawal'}
            </button>
          </div>
        )}

        {done && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <ShieldCheck size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Withdrawal address confirmed</p>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              Your BIO will be sent to this address on the distribution date.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
