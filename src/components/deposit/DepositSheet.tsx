'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, AlertTriangle, Shield } from 'lucide-react'
import QRCode from 'qrcode'
import { Spinner } from '@/components/ui/Spinner'
import { haptic } from '@/lib/telegram'
import { fmtEth } from '@/lib/utils'
import type { User } from '@/types'

interface Props { open: boolean; onClose: () => void; user: User }

const MIN_ETH = 0.02

export function DepositSheet({ open, onClose, user }: Props) {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)
  const canvasRef             = useRef<HTMLCanvasElement>(null)
  const loaded                = useRef(false)

  useEffect(() => {
    if (open && !loaded.current) { loaded.current = true; loadAddress() }
    if (!open) { loaded.current = false; setAddress(''); setError('') }
  }, [open])

  useEffect(() => {
    if (address && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, address, {
        width: 180,
        color: { dark: '#060d06', light: '#ffffff' },
        margin: 2,
      })
    }
  }, [address])

  const loadAddress = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id }),
      })
      const data = await res.json()
      if (data.pay_address) setAddress(data.pay_address)
      else setError(data.error || 'Failed to generate deposit address. Check NOWPayments API key.')
    } catch {
      setError('Network error. Please try again.')
    } finally { setLoading(false) }
  }

  const copyAddr = () => {
    navigator.clipboard.writeText(address)
    setCopied(true); haptic()
    setTimeout(() => setCopied(false), 2000)
  }

  const pct = Math.min((user.eth_balance / MIN_ETH) * 100, 100)

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
              background: '#0a1a0a', border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '28px 28px 0 0',
              maxHeight: '92dvh', overflowY: 'auto',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 16px', borderBottom: '1px solid rgba(34,197,94,0.08)',
            }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Deposit ETH</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Add ETH to your withdrawal balance</p>
              </div>
              <button onClick={onClose} style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '1px solid rgba(34,197,94,0.15)', background: '#0f200f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--muted)',
              }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* ETH progress card */}
              <div style={{
                padding: 16, borderRadius: 20, background: '#0f200f',
                border: '1px solid rgba(34,197,94,0.12)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                      ETH Balance
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text)' }}>
                      {fmtEth(user.eth_balance)} <span style={{ fontSize: 13, color: '#a78bfa' }}>ETH</span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                      Required
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text)' }}>
                      {MIN_ETH} ETH
                    </p>
                  </div>
                </div>
                <div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--surface)', overflow: 'hidden', marginBottom: 6 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: 4,
                        background: pct >= 100
                          ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                          : 'linear-gradient(90deg,#92400e,#f59e0b)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)' }}>
                    <span>{pct.toFixed(0)}% funded</span>
                    {user.eth_balance < MIN_ETH && (
                      <span style={{ color: '#fbbf24' }}>
                        Still needed: {fmtEth(MIN_ETH - user.eth_balance)} ETH
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                borderRadius: 14, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
              }}>
                <AlertTriangle size={14} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'rgba(147,197,253,0.8)', lineHeight: 1.5 }}>
                  Deposit any amount of ETH — no minimum. Your balance accumulates until it reaches{' '}
                  <strong>0.02 ETH</strong>, after which you can withdraw BIO.
                </p>
              </div>

              {/* Loading */}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '28px 0' }}>
                  <Spinner size={32} />
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>Generating your deposit address…</p>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  }}>
                    <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: '#fca5a5' }}>{error}</p>
                  </div>
                  <button onClick={loadAddress} style={{
                    padding: '12px', borderRadius: 14, border: '1px solid rgba(34,197,94,0.2)',
                    background: 'rgba(34,197,94,0.06)', color: '#22c55e',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Retry
                  </button>
                </div>
              )}

              {/* Address + QR */}
              {!loading && address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* QR code */}
                  <div style={{
                    display: 'flex', justifyContent: 'center', padding: 16,
                    borderRadius: 20, background: '#ffffff',
                  }}>
                    <canvas ref={canvasRef} />
                  </div>
                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)' }}>
                    Scan to get deposit address
                  </p>

                  {/* Address box */}
                  <div style={{
                    padding: 16, borderRadius: 20, background: '#0f200f',
                    border: '1px solid rgba(34,197,94,0.12)',
                  }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                      Deposit Address (ETH / ERC-20)
                    </p>
                    <p style={{
                      fontFamily: 'monospace', fontSize: 11, color: 'var(--text)',
                      wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 12,
                    }}>
                      {address}
                    </p>
                    <button
                      onClick={copyAddr}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                        color: '#4ade80', fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Address</>}
                    </button>
                  </div>

                  {/* Warning */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                  }}>
                    <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.8)', lineHeight: 1.5 }}>
                      <strong>Send only ETH (ERC-20)</strong> to this address. Other assets may be permanently lost.
                    </p>
                  </div>

                  {/* Confirmation note */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    borderRadius: 14, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                    marginBottom: 4,
                  }}>
                    <Shield size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'rgba(134,239,172,0.8)', lineHeight: 1.5 }}>
                      Credited after confirmation — typically <strong>2–5 minutes</strong>. Your ETH balance updates automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
