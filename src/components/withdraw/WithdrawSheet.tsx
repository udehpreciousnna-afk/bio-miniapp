'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Copy, Check, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { BioLogo } from '@/components/ui/BioLogo'
import { Spinner } from '@/components/ui/Spinner'
import { haptic, hapticSuccess, hapticError } from '@/lib/telegram'
import { fmtBio, fmtUsd, fmtEth, shortAddr } from '@/lib/utils'
import type { User, Prices } from '@/types'

type Step = 'select' | 'form' | 'insufficient' | 'success'
const MIN_ETH = 0.02

interface Props {
  open: boolean
  onClose: () => void
  user: User
  prices: Prices
  onDepositOpen: () => void
  onSuccess: () => void
}

export function WithdrawSheet({ open, onClose, user, prices, onDepositOpen, onSuccess }: Props) {
  const [step, setStep]       = useState<Step>('select')
  const [address, setAddress] = useState(user.wallet_address || '')
  const [amount, setAmount]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [successId, setSuccessId] = useState<number | null>(null)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (open) { setStep('select'); setError(''); setAmount('') }
  }, [open])

  useEffect(() => {
    setAddress(user.wallet_address || '')
  }, [user.wallet_address])

  const amountNum = parseFloat(amount) || 0
  const amountUsd = amountNum * prices.bio

  const validate = () => {
    if (!address || !address.startsWith('0x') || address.length !== 42)
      return 'Enter a valid ERC-20 wallet address (starts with 0x)'
    if (amountNum <= 0) return 'Enter an amount to withdraw'
    if (amountNum < 500) return 'Minimum withdrawal is 500 BIO'
    if (amountNum > user.bio_balance) return 'Amount exceeds your BIO balance'
    return ''
  }

  const handleWithdraw = async () => {
    const err = validate()
    if (err) { setError(err); hapticError(); return }
    if (user.eth_balance < MIN_ETH) { setStep('insufficient'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, address, amount: amountNum }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessId(data.withdrawal_id ?? null)
        setStep('success')
        hapticSuccess()
        onSuccess()
      } else {
        setError(data.error || 'Withdrawal failed. Please try again.')
        hapticError()
      }
    } catch {
      setError('Network error. Please try again.')
      hapticError()
    } finally {
      setLoading(false)
    }
  }

  const copyAddr = () => {
    navigator.clipboard.writeText(address)
    setCopied(true); haptic()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 40 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
              background: '#0a1a0a',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '28px 28px 0 0',
              maxHeight: '92dvh', overflowY: 'auto',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            }}
          >
            {/* ── Token Select ── */}
            {step === 'select' && (
              <>
                <SheetHeader title="Withdraw" subtitle="Select a token to withdraw" onClose={onClose} />
                <div style={{ padding: '0 20px 20px' }}>
                  <button
                    onClick={() => { haptic(); setStep('form') }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: 16, borderRadius: 20, cursor: 'pointer', textAlign: 'left',
                      background: '#0f200f', border: '1px solid rgba(34,197,94,0.12)',
                      color: 'var(--text)',
                    }}
                  >
                    <BioLogo size={48} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>BIO</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>BIO Protocol</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 16 }}>
                        {fmtBio(user.bio_balance)}
                      </p>
                      <p style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>
                        {prices.bio > 0 ? `≈ ${fmtUsd(user.bio_balance * prices.bio)}` : '—'}
                      </p>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* ── Withdraw Form ── */}
            {step === 'form' && (
              <>
                <SheetHeader title="Withdraw BIO" subtitle="Send BIO tokens to your external wallet"
                  onBack={() => setStep('select')} onClose={onClose} />
                <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Balance box */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                    borderRadius: 20, background: '#0f200f', border: '1px solid rgba(34,197,94,0.12)',
                  }}>
                    <BioLogo size={40} />
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Balance</p>
                      <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 }}>
                        {fmtBio(user.bio_balance)} <span style={{ color: '#22c55e', fontSize: 14 }}>BIO</span>
                      </p>
                      {prices.bio > 0 && <p style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>≈ {fmtUsd(user.bio_balance * prices.bio)}</p>}
                    </div>
                  </div>

                  {/* Address input */}
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Destination Address
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                      borderRadius: 14, background: '#060d06', border: '1px solid rgba(34,197,94,0.12)',
                    }}>
                      <input
                        value={address}
                        onChange={e => { setAddress(e.target.value); setError('') }}
                        placeholder="Enter or paste wallet address"
                        style={{
                          flex: 1, background: 'none', border: 'none', outline: 'none',
                          color: 'var(--text)', fontFamily: 'monospace', fontSize: 13,
                        }}
                      />
                      <button onClick={copyAddr} style={{
                        padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: 'rgba(34,197,94,0.1)', color: '#22c55e', flexShrink: 0,
                      }}>
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Amount input */}
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Amount
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                      borderRadius: 14, background: '#060d06', border: '1px solid rgba(34,197,94,0.12)',
                    }}>
                      <BioLogo size={26} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>BIO</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => { setAmount(e.target.value); setError('') }}
                        placeholder="0.00"
                        style={{
                          flex: 1, background: 'none', border: 'none', outline: 'none', textAlign: 'right',
                          color: 'var(--text)', fontFamily: 'monospace', fontSize: 20, fontWeight: 700,
                        }}
                      />
                      <button
                        onClick={() => setAmount(String(user.bio_balance))}
                        style={{
                          padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.25)',
                          background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                        }}
                      >MAX</button>
                    </div>
                    <p style={{ textAlign: 'right', fontSize: 11, color: '#22c55e', marginTop: 6 }}>
                      ≈ {fmtUsd(amountUsd)} USD
                    </p>
                  </div>

                  {error && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                      borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    }}>
                      <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 13, color: '#fca5a5' }}>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleWithdraw}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                      color: '#060d06', fontWeight: 700, fontSize: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 4px 24px rgba(34,197,94,0.3)',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? <><Spinner size={18} color="#060d06" /> Processing…</> : 'Withdraw BIO Token'}
                  </button>
                </div>
              </>
            )}

            {/* ── Insufficient ETH ── */}
            {step === 'insufficient' && (
              <>
                <SheetHeader title="Withdraw BIO" subtitle="Send BIO tokens to your external wallet"
                  onBack={() => setStep('form')} onClose={onClose} />
                <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                    borderRadius: 20, background: '#0f200f', border: '1px solid rgba(34,197,94,0.12)',
                  }}>
                    <BioLogo size={40} />
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Balance</p>
                      <p style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace' }}>
                        {fmtBio(user.bio_balance)} <span style={{ color: '#22c55e', fontSize: 13 }}>BIO</span>
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                    borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  }}>
                    <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: '#fca5a5', marginBottom: 4 }}>
                        Insufficient ETH for network fees
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.7)', lineHeight: 1.5 }}>
                        You need at least <strong>0.02 ETH</strong> to process this withdrawal.
                        Your balance: <strong>{fmtEth(user.eth_balance)} ETH</strong>
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ padding: 14, borderRadius: 16, background: '#0f200f', border: '1px solid rgba(34,197,94,0.1)' }}>
                    {[
                      ['Your ETH', `${fmtEth(user.eth_balance)} ETH`, '#fbbf24'],
                      ['Required', `${MIN_ETH} ETH`, 'var(--text)'],
                      ['Still needed', `${fmtEth(Math.max(0, MIN_ETH - user.eth_balance))} ETH`, '#f87171'],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: 'var(--muted)' }}>{l}</span>
                        <span style={{ fontFamily: 'monospace', color: c as string }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--surface)', marginTop: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${Math.min((user.eth_balance / MIN_ETH) * 100, 100)}%`,
                        background: 'linear-gradient(90deg,#92400e,#f59e0b)',
                      }} />
                    </div>
                  </div>

                  <button
                    onClick={() => { haptic(); onDepositOpen() }}
                    style={{
                      width: '100%', padding: 16, borderRadius: 20, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
                      color: '#c4b5fd', fontWeight: 700, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 4px 20px rgba(139,92,246,0.25)',
                    }}
                  >
                    ⬡ Insufficient ETH — Top Up
                  </button>
                </div>
              </>
            )}

            {/* ── Success ── */}
            {step === 'success' && (
              <>
                <SheetHeader title="Withdrawal Submitted" onClose={onClose} />
                <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                    background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e',
                    boxShadow: '0 0 30px rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle2 size={36} color="#22c55e" />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Processing Your Withdrawal</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
                    Your <span style={{ color: '#22c55e', fontWeight: 600 }}>{fmtBio(amountNum)} BIO</span> will be sent
                    to your wallet within <strong style={{ color: 'var(--text)' }}>24 hours</strong>.
                  </p>
                  {successId && (
                    <div style={{
                      padding: 14, borderRadius: 16, background: '#0f200f',
                      border: '1px solid rgba(34,197,94,0.12)', marginBottom: 16, textAlign: 'left',
                    }}>
                      {[
                        ['Withdrawal ID', `#${successId}`],
                        ['BIO Amount', `${fmtBio(amountNum)} BIO`],
                        ['Destination', shortAddr(address)],
                        ['Status', 'Processing'],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: 'var(--muted)' }}>{l}</span>
                          <span style={{ color: l === 'Status' ? '#22c55e' : 'var(--text)', fontFamily: 'monospace', fontSize: 11 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <a
                    href="https://t.me/BioTokenAdmin"
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                      borderRadius: 14, background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e',
                      fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 10,
                    }}
                  >
                    💬 Message BIO Admin for support
                  </a>
                  <br />
                  <button onClick={onClose} style={{
                    padding: '12px 24px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
                    background: 'none', color: 'rgba(240,253,240,0.5)', fontSize: 13, cursor: 'pointer', marginTop: 6,
                  }}>
                    Close
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SheetHeader({ title, subtitle, onBack, onClose }: {
  title: string; subtitle?: string; onBack?: () => void; onClose: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 0',
      borderBottom: '1px solid rgba(34,197,94,0.08)', paddingBottom: 16,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(34,197,94,0.15)',
          background: '#0f200f', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--muted)', flexShrink: 0,
        }}>
          <ArrowLeft size={15} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      <button onClick={onClose} style={{
        width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(34,197,94,0.15)',
        background: '#0f200f', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--muted)', flexShrink: 0,
      }}>
        <X size={15} />
      </button>
    </div>
  )
}
