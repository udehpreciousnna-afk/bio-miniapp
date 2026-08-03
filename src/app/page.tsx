'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, Copy, Check, History, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { BioLogo } from '@/components/ui/BioLogo'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { WithdrawSheet } from '@/components/withdraw/WithdrawSheet'
import { DepositSheet } from '@/components/deposit/DepositSheet'
import { initTelegramApp, getInitData, getTelegramUser, haptic } from '@/lib/telegram'
import { shortAddr, fmtBio, fmtUsd, fmtEth, fmtDate } from '@/lib/utils'
import type { User, Prices, Withdrawal } from '@/types'

type AppState = 'loading' | 'error' | 'ready'

export default function Home() {
  const [state, setState]             = useState<AppState>('loading')
  const [user, setUser]               = useState<User | null>(null)
  const [prices, setPrices]           = useState<Prices>({ bio: 0, eth: 0 })
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showDeposit, setShowDeposit]   = useState(false)
  const [showHistory, setShowHistory]   = useState(false)
  const [walletCopied, setWalletCopied] = useState(false)
  const [expandedW, setExpandedW]       = useState<number | null>(null)
  const [errorMsg, setErrorMsg]         = useState('')

  const loadPrices = useCallback(async () => {
    try {
      const r = await fetch('/api/prices')
      setPrices(await r.json())
    } catch {}
  }, [])

  const loadWithdrawals = useCallback(async (uid: number) => {
    try {
      const r = await fetch(`/api/withdrawals?user_id=${uid}`)
      const d = await r.json()
      setWithdrawals(d.withdrawals ?? [])
    } catch {}
  }, [])

  useEffect(() => {
    initTelegramApp()

    const init = async () => {
      // Get Telegram user from WebApp
      const tgUser = getTelegramUser()
      const initData = getInitData()

      // In development without Telegram, use mock
      const isDev = process.env.NODE_ENV === 'development' && !initData

      if (!tgUser && !isDev) {
        setErrorMsg('Please open this app from the BIO Protocol bot in Telegram.')
        setState('error')
        return
      }

      try {
        // Sync user — Next.js API route verifies initData server-side
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: isDev
              ? 'dev_mode'
              : initData,
            // Pass dev user for local testing
            devUser: isDev ? {
              id: 123456789,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
            } : undefined,
          }),
        })
        const data = await res.json()
        if (!data.user) throw new Error(data.error ?? 'No user returned')

        setUser(data.user)
        setState('ready')
        await Promise.all([loadPrices(), loadWithdrawals(data.user.user_id)])
      } catch (e: any) {
        setErrorMsg(e.message || 'Failed to load your account.')
        setState('error')
      }
    }

    init()
    const interval = setInterval(loadPrices, 60_000)
    return () => clearInterval(interval)
  }, [loadPrices, loadWithdrawals])

  const copyWallet = () => {
    if (!user?.wallet_address) return
    navigator.clipboard.writeText(user.wallet_address)
    setWalletCopied(true)
    haptic()
    setTimeout(() => setWalletCopied(false), 2000)
  }

  const refreshUser = async () => {
    if (!user) return
    try {
      const r = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: getInitData() }),
      })
      const d = await r.json()
      if (d.user) { setUser(d.user); loadWithdrawals(d.user.user_id) }
    } catch {}
  }

  // ── Loading ──────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <BioLogo size={52} />
        <Spinner size={24} />
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your portal…</p>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (state === 'error' || !user) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 p-6 text-center">
        <BioLogo size={52} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Unable to Load
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{errorMsg}</p>
        </div>
      </div>
    )
  }

  const bioUsd = user.bio_balance * prices.bio
  const ethUsd = user.eth_balance * prices.eth
  const name   = user.telegram_name || user.username || 'User'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 80px' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '28px 0 20px' }}
      >
        <BioLogo size={52} />
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          BIO Protocol
        </h1>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Web3 Rewards Portal
        </p>
      </motion.div>

      {/* ── Profile card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass bio-glow"
        style={{ borderRadius: 24, padding: 20, marginBottom: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#060d06',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', marginTop: 2 }}>
              ID: {user.user_id}
            </p>
          </div>
          {/* Active badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>Active</span>
          </div>
        </div>

        {/* Wallet row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 14,
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>👛</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              Wallet Address
            </p>
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.wallet_address ? shortAddr(user.wallet_address, 16, 6) : 'No wallet linked'}
            </p>
          </div>
          {user.wallet_address && (
            <button
              onClick={copyWallet}
              style={{
                padding: '6px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'rgba(34,197,94,0.12)', color: '#22c55e', flexShrink: 0,
              }}
            >
              {walletCopied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Action buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}
      >
        <ActionBtn icon="⬇️" label="Deposit ETH" onClick={() => { haptic(); setShowDeposit(true) }} primary={false} />
        <ActionBtn icon="⬆️" label="Withdraw BIO" onClick={() => { haptic(); setShowWithdraw(true) }} primary />
      </motion.div>

      {/* ── BIO balance card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass bio-glow"
        style={{ borderRadius: 24, padding: 20, marginBottom: 10 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <BioLogo size={42} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>BIO</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>BIO Protocol</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text)', lineHeight: 1 }}>
              {fmtBio(user.bio_balance)}
            </p>
            <p style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>
              {prices.bio > 0 ? `≈ ${fmtUsd(bioUsd)}` : '—'}
            </p>
          </div>
        </div>
        {prices.bio > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
            <span>Market price</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{fmtUsd(prices.bio)} / BIO</span>
          </div>
        )}
      </motion.div>

      {/* ── ETH balance card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass"
        style={{ borderRadius: 24, padding: 20, marginBottom: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
            border: '1.5px solid rgba(139,92,246,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>⬡</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>ETH</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>Network fee balance</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text)', lineHeight: 1 }}>
              {fmtEth(user.eth_balance)}
            </p>
            <p style={{ fontSize: 11, color: '#a78bfa', marginTop: 4 }}>
              {prices.eth > 0 ? `≈ ${fmtUsd(ethUsd)}` : '—'}
            </p>
          </div>
        </div>
        {/* ETH progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 6 }}>
            <span style={{ color: 'var(--muted)' }}>Required for withdrawal</span>
            <span style={{ color: user.eth_balance >= 0.02 ? '#22c55e' : '#fbbf24', fontFamily: 'monospace' }}>
              {fmtEth(Math.min(user.eth_balance, 0.02))} / 0.02 ETH
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((user.eth_balance / 0.02) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 3,
                background: user.eth_balance >= 0.02
                  ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                  : 'linear-gradient(90deg,#92400e,#f59e0b)',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Withdrawal History ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass"
        style={{ borderRadius: 24, overflow: 'hidden' }}
      >
        <button
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text)',
          }}
          onClick={() => { haptic(); setShowHistory(h => !h) }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={18} color="#22c55e" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Withdrawal History</span>
            {withdrawals.length > 0 && (
              <span style={{
                padding: '2px 8px', borderRadius: 20,
                background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                fontSize: 11, fontWeight: 700,
              }}>
                {withdrawals.length}
              </span>
            )}
          </div>
          {showHistory ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 16px 16px' }}>
                {withdrawals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>📭</p>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>No withdrawals yet</p>
                  </div>
                ) : withdrawals.map(w => (
                  <div key={w.id} style={{ marginBottom: 8 }}>
                    <button
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 16,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        cursor: 'pointer', color: 'var(--text)', textAlign: 'left',
                      }}
                      onClick={() => setExpandedW(expandedW === w.id ? null : w.id)}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(34,197,94,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>☣️</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{fmtBio(w.bio_amount)} BIO</p>
                        <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {shortAddr(w.wallet_address)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <StatusBadge status={w.status} />
                        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                          {fmtDate(w.submitted_at)}
                        </p>
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedW === w.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            margin: '4px 0 0', padding: '12px 14px', borderRadius: 14,
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            fontSize: 12,
                          }}>
                            {[
                              ['ID', `#${w.id}`],
                              ['Wallet', shortAddr(w.wallet_address, 10, 6)],
                              ['Amount', `${fmtBio(w.bio_amount)} BIO`],
                              ['Submitted', fmtDate(w.submitted_at)],
                              w.processed_at ? ['Processed', fmtDate(w.processed_at)] : null,
                            ].filter(Boolean).map(([label, value]) => (
                              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: 'var(--muted)' }}>{label}</span>
                                <span style={{ color: 'var(--text)', fontFamily: 'monospace', fontSize: 11 }}>{value}</span>
                              </div>
                            ))}
                            {w.tx_hash && (
                              <a
                                href={`https://etherscan.io/tx/${w.tx_hash}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 11, fontFamily: 'monospace', marginTop: 4 }}
                              >
                                {shortAddr(w.tx_hash, 8, 6)} <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Modals ── */}
      <WithdrawSheet
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        user={user}
        prices={prices}
        onDepositOpen={() => { setShowWithdraw(false); setTimeout(() => setShowDeposit(true), 200) }}
        onSuccess={refreshUser}
      />
      <DepositSheet
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        user={user}
      />
    </div>
  )
}

function ActionBtn({ icon, label, onClick, primary }: {
  icon: string; label: string; onClick: () => void; primary: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '18px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
        transition: 'all 0.15s',
        background: primary
          ? 'linear-gradient(135deg, #0f3d1f, #1a5c2a)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        boxShadow: primary ? '0 4px 20px rgba(34,197,94,0.15)' : 'none',
        border: primary ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.08)',
        color: primary ? '#4ade80' : '#f0fdf4',
        fontSize: 13, fontWeight: 600,
      }}
    >
      <span style={{
        width: 40, height: 40, borderRadius: 12, fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: primary ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
      }}>
        {icon}
      </span>
      {label}
    </button>
  )
}
