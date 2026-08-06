'use client'
import { useState, useEffect } from 'react'
import { X, ArrowLeft, Copy, Check, AlertTriangle, CheckCircle2, ClipboardPaste } from 'lucide-react'
import { BioLogo, BioIcon } from '@/components/ui/BioLogo'
import { Spinner } from '@/components/ui/Spinner'
import { haptic, hapticSuccess, hapticError } from '@/lib/telegram'
import { fmtBio, fmtUsd, fmtEth, shortAddr } from '@/lib/utils'
import type { User, Prices } from '@/types'

type Step = 'select' | 'form' | 'insufficient' | 'success'
const MIN_ETH = 0.02

interface Props {
  open: boolean; onClose: () => void
  user: User; prices: Prices
  onDepositOpen: () => void; onSuccess: () => void
}

export function WithdrawSheet({ open, onClose, user, prices, onDepositOpen, onSuccess }: Props) {
  const [step, setStep]         = useState<Step>('select')
  const [address, setAddress]   = useState(user.wallet_address || '')
  const [amount, setAmount]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [successId, setSuccessId] = useState<number|null>(null)
  const [copied, setCopied]     = useState(false)

  useEffect(() => { if (open) { setStep('select'); setError(''); setAmount('') } }, [open])
  useEffect(() => { setAddress(user.wallet_address || '') }, [user.wallet_address])

  const amountNum = parseFloat(amount) || 0
  const amountUsd = amountNum * prices.bio

  const validate = () => {
    if (!address || !address.startsWith('0x') || address.length !== 42)
      return 'Enter a valid ERC-20 wallet address (starts with 0x)'
    if (amountNum <= 0) return 'Enter an amount'
    if (amountNum < 500) return 'Minimum withdrawal is 500 BIO'
    if (amountNum > user.bio_balance) return 'Exceeds your BIO balance'
    return ''
  }

  const handleWithdraw = async () => {
    const err = validate()
    if (err) { setError(err); hapticError(); return }
    if (user.eth_balance < MIN_ETH) { setStep('insufficient'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, address, amount: amountNum }),
      })
      const data = await res.json()
      if (data.success) { setSuccessId(data.withdrawal_id ?? null); setStep('success'); hapticSuccess(); onSuccess() }
      else { setError(data.error || 'Withdrawal failed'); hapticError() }
    } catch { setError('Network error. Please try again.'); hapticError() }
    finally { setLoading(false) }
  }

  const paste = async () => {
    try { const t = await navigator.clipboard.readText(); setAddress(t); setError('') } catch {}
  }

  const copyAddr = () => {
    navigator.clipboard.writeText(address)
    setCopied(true); haptic(); setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
        backdropFilter:'blur(8px)', zIndex:40,
        animation:'fadeIn 0.2s ease',
      }}/>

      {/* Sheet */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background:'linear-gradient(180deg, rgba(5,20,10,0.98) 0%, rgba(3,12,6,0.99) 100%)',
        border:'1px solid rgba(34,197,94,0.2)',
        borderRadius:'24px 24px 0 0',
        maxHeight:'92dvh', overflowY:'auto',
        paddingBottom:'max(24px, env(safe-area-inset-bottom))',
        boxShadow:'0 -20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(34,197,94,0.1)',
        animation:'slideUp 0.32s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* ── SELECT TOKEN ── */}
        {step === 'select' && (<>
          <SheetHeader title="Withdraw" subtitle="Select a token to withdraw" onClose={onClose}/>
          <div style={{ padding:'8px 20px 24px' }}>
            {/* BIO option */}
            <button onClick={() => { haptic(); setStep('form') }} style={{
              width:'100%', display:'flex', alignItems:'center', gap:16,
              padding:'18px 16px', borderRadius:18, cursor:'pointer', textAlign:'left',
              background:'rgba(10,40,20,0.5)', border:'1px solid rgba(34,197,94,0.2)',
              backdropFilter:'blur(12px)', color:'#fff', marginBottom:10,
              transition:'all 0.2s',
            }}>
              <BioIcon size={52}/>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:16 }}>BIO</p>
                <p style={{ fontSize:12, color:'rgba(134,239,172,0.5)', marginTop:3 }}>BIO Protocol</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p className="mono" style={{ fontWeight:700, fontSize:18, color:'#fff' }}>
                  {fmtBio(user.bio_balance)}
                </p>
                <p style={{ fontSize:12, color:'#22c55e', marginTop:3 }}>
                  {prices.bio > 0 ? `≈ $${(user.bio_balance * prices.bio).toFixed(2)}` : '—'}
                </p>
              </div>
            </button>
          </div>
        </>)}

        {/* ── WITHDRAW FORM ── */}
        {step === 'form' && (<>
          <SheetHeader title="Withdraw" subtitle="Send funds to your external wallet"
            onBack={() => setStep('select')} onClose={onClose}/>
          <div style={{ padding:'8px 20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

            {/* Balance card */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'16px', borderRadius:16,
              background:'rgba(10,40,20,0.5)', border:'1px solid rgba(34,197,94,0.15)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <BioIcon size={42}/>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:'rgba(134,239,172,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>
                    Balance
                  </p>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                    <span className="mono" style={{ fontSize:28, fontWeight:800, color:'#fff', lineHeight:1 }}>
                      {fmtBio(user.bio_balance)}
                    </span>
                    <span style={{ fontSize:14, fontWeight:700, color:'#22c55e' }}>BIO</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#22c55e' }}>
                  {prices.bio > 0 ? `≈ $${(user.bio_balance * prices.bio).toFixed(2)} USD` : '—'}
                </p>
              </div>
            </div>

            {/* Destination */}
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(134,239,172,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
                Destination Address
              </p>
              <div style={{
                display:'flex', alignItems:'center', gap:0,
                borderRadius:14, overflow:'hidden',
                border:'1px solid rgba(34,197,94,0.18)',
                background:'rgba(5,20,10,0.7)',
              }}>
                <input
                  value={address}
                  onChange={e => { setAddress(e.target.value); setError('') }}
                  placeholder="Enter or paste wallet address"
                  className="mono"
                  style={{
                    flex:1, background:'none', border:'none', outline:'none',
                    color:'#fff', fontSize:13, padding:'14px 14px',
                    fontFamily:'JetBrains Mono, monospace',
                  }}
                />
                <button onClick={paste} style={{
                  padding:'0 16px', height:'100%', minHeight:48,
                  background:'rgba(34,197,94,0.15)', border:'none',
                  borderLeft:'1px solid rgba(34,197,94,0.2)',
                  cursor:'pointer', color:'#22c55e', display:'flex', alignItems:'center',
                }}>
                  <ClipboardPaste size={16}/>
                </button>
              </div>

              {/* Saved address hint */}
              {user.wallet_address && (
                <div style={{
                  marginTop:8, padding:'10px 13px', borderRadius:10,
                  background:'rgba(10,40,20,0.4)', border:'1px solid rgba(34,197,94,0.1)',
                }}>
                  <p style={{ fontSize:10, color:'rgba(134,239,172,0.5)', marginBottom:4 }}>Select Your Payment Address:</p>
                  <button onClick={() => setAddress(user.wallet_address)} style={{
                    background:'none', border:'none', cursor:'pointer', padding:0,
                    color:'rgba(134,239,172,0.7)', fontFamily:'monospace', fontSize:11,
                  }}>
                    {shortAddr(user.wallet_address, 14, 8)}
                  </button>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(134,239,172,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
                Amount
              </p>
              <div style={{
                display:'flex', alignItems:'center', gap:10, padding:'13px 14px',
                borderRadius:14, background:'rgba(5,20,10,0.7)',
                border:'1px solid rgba(34,197,94,0.18)',
              }}>
                <BioIcon size={28}/>
                <span style={{ fontSize:13, fontWeight:700, color:'#22c55e' }}>BIO</span>
                <input
                  type="number" value={amount}
                  onChange={e => { setAmount(e.target.value); setError('') }}
                  placeholder="0.00"
                  className="mono"
                  style={{
                    flex:1, background:'none', border:'none', outline:'none', textAlign:'right',
                    color:'#fff', fontSize:22, fontWeight:700,
                    fontFamily:'JetBrains Mono, monospace',
                  }}
                />
                <button onClick={() => setAmount(String(user.bio_balance))} style={{
                  padding:'6px 14px', borderRadius:8,
                  background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)',
                  color:'#22c55e', fontSize:11, fontWeight:800, cursor:'pointer', letterSpacing:'0.05em',
                }}>MAX</button>
              </div>
              <p style={{ textAlign:'right', fontSize:12, color:'#22c55e', marginTop:6 }}>
                ≈ ${amountUsd > 0 ? amountUsd.toFixed(2) : '0.00'} USD
              </p>
            </div>

            {error && (
              <div style={{
                display:'flex', alignItems:'flex-start', gap:10, padding:'12px 13px',
                borderRadius:12, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
              }}>
                <AlertTriangle size={14} color="#f87171" style={{ flexShrink:0, marginTop:1 }}/>
                <p style={{ fontSize:13, color:'#fca5a5' }}>{error}</p>
              </div>
            )}

            {/* Withdraw button */}
            <button onClick={handleWithdraw} disabled={loading} style={{
              width:'100%', padding:'16px', borderRadius:14, border:'none', cursor:'pointer',
              background: loading ? '#16a34a' : 'linear-gradient(90deg, #22c55e, #16a34a)',
              color:'#000', fontWeight:800, fontSize:15,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow: loading ? 'none' : '0 0 30px rgba(34,197,94,0.4), 0 4px 20px rgba(34,197,94,0.3)',
              opacity: loading ? 0.8 : 1,
              transition:'all 0.2s',
            }}>
              {loading
                ? <><Spinner size={18} color="#000"/> Processing…</>
                : amount && amountNum > 0
                  ? `Withdraw ${fmtBio(amountNum)} BIO`
                  : 'Withdraw BIO Token'
              }
            </button>
          </div>
        </>)}

        {/* ── INSUFFICIENT ETH ── */}
        {step === 'insufficient' && (<>
          <SheetHeader title="Withdraw" subtitle="Send funds to your external wallet"
            onBack={() => setStep('form')} onClose={onClose}/>
          <div style={{ padding:'8px 20px 24px', display:'flex', flexDirection:'column', gap:14 }}>

            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'16px', borderRadius:16,
              background:'rgba(10,40,20,0.5)', border:'1px solid rgba(34,197,94,0.15)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <BioIcon size={42}/>
                <div>
                  <p style={{ fontSize:10, color:'rgba(134,239,172,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Balance</p>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                    <span className="mono" style={{ fontSize:26, fontWeight:800, color:'#fff' }}>{fmtBio(user.bio_balance)}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#22c55e' }}>BIO</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize:13, color:'#22c55e' }}>≈ ${(user.bio_balance * prices.bio).toFixed(2)} USD</p>
            </div>

            {/* Error card */}
            <div style={{
              display:'flex', alignItems:'flex-start', gap:12, padding:'14px',
              borderRadius:14, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)',
            }}>
              <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink:0, marginTop:1 }}/>
              <div>
                <p style={{ fontWeight:700, fontSize:13, color:'#fbbf24', marginBottom:5 }}>
                  Insufficient SOL for network fees
                </p>
                <p style={{ fontSize:12, color:'rgba(251,191,36,0.7)', lineHeight:1.5 }}>
                  You need at least <strong>0.02 ETH</strong> to cover transaction fees.
                  Your ETH balance: <strong className="mono">{fmtEth(user.eth_balance)} ETH</strong>
                </p>
              </div>
            </div>

            {/* Progress */}
            <div style={{ padding:'14px', borderRadius:14, background:'rgba(10,40,20,0.4)', border:'1px solid rgba(34,197,94,0.1)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, color:'rgba(134,239,172,0.5)' }}>Your ETH</span>
                <span className="mono" style={{ fontSize:12, color:'#fbbf24' }}>{fmtEth(user.eth_balance)} ETH</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, color:'rgba(134,239,172,0.5)' }}>Required</span>
                <span className="mono" style={{ fontSize:12, color:'#fff' }}>{MIN_ETH} ETH</span>
              </div>
              <div style={{ height:6, borderRadius:3, background:'rgba(10,20,10,0.8)', overflow:'hidden', marginTop:10 }}>
                <div style={{
                  height:'100%', borderRadius:3,
                  width:`${Math.min((user.eth_balance/MIN_ETH)*100,100)}%`,
                  background:'linear-gradient(90deg, #92400e, #f59e0b)',
                  transition:'width 0.8s ease',
                }}/>
              </div>
            </div>

            {/* Top up button */}
            <button onClick={() => { haptic(); onDepositOpen() }} style={{
              width:'100%', padding:'16px', borderRadius:14, cursor:'pointer',
              background:'linear-gradient(90deg, #1e293b, #0f172a)',
              border:'1px solid rgba(56,189,248,0.3)',
              color:'#38bdf8', fontWeight:700, fontSize:14,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow:'0 0 20px rgba(56,189,248,0.1)',
            }}>
              ⬡ Insufficient Solana! Topup
            </button>
          </div>
        </>)}

        {/* ── SUCCESS ── */}
        {step === 'success' && (<>
          <SheetHeader title="Withdrawal Submitted" onClose={onClose}/>
          <div style={{ padding:'16px 20px 24px', textAlign:'center' }}>
            <div style={{
              width:72, height:72, borderRadius:'50%', margin:'0 auto 20px',
              background:'rgba(34,197,94,0.1)', border:'2px solid #22c55e',
              boxShadow:'0 0 40px rgba(34,197,94,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'pulse-dot 2s infinite',
            }}>
              <CheckCircle2 size={36} color="#22c55e"/>
            </div>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:10 }}>Processing Your Withdrawal</h3>
            <p style={{ fontSize:13, color:'rgba(134,239,172,0.6)', lineHeight:1.7, marginBottom:20 }}>
              Your <span style={{ color:'#22c55e', fontWeight:700 }}>{fmtBio(amountNum)} BIO</span> will be sent
              to your wallet within <strong style={{ color:'#fff' }}>24 hours</strong>.
            </p>
            {successId && (
              <div style={{ padding:'14px', borderRadius:16, background:'rgba(10,40,20,0.5)', border:'1px solid rgba(34,197,94,0.15)', marginBottom:20, textAlign:'left' }}>
                {([['Withdrawal ID',`#${successId}`],['BIO Amount',`${fmtBio(amountNum)} BIO`],['Destination',shortAddr(address)],['Status','Processing']] as [string,string][]).map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:12, color:'rgba(134,239,172,0.5)' }}>{l}</span>
                    <span className="mono" style={{ fontSize:11, color: l==='Status' ? '#22c55e' : '#fff' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            <a href="https://t.me/BioTokenAdmin" target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:8, padding:'11px 20px',
              borderRadius:12, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)',
              color:'#22c55e', fontSize:13, fontWeight:600, textDecoration:'none', marginBottom:12,
            }}>💬 Message BIO Admin for support</a>
            <br/>
            <button onClick={onClose} style={{
              padding:'10px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)',
              background:'none', color:'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer', marginTop:8,
            }}>Close</button>
          </div>
        </>)}
      </div>
    </>
  )
}

function SheetHeader({ title, subtitle, onBack, onClose }: {
  title:string; subtitle?:string; onBack?:()=>void; onClose:()=>void
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'20px 20px 16px', borderBottom:'1px solid rgba(34,197,94,0.08)' }}>
      {onBack && (
        <button onClick={onBack} style={{
          width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)',
          background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'rgba(255,255,255,0.6)', flexShrink:0,
        }}><ArrowLeft size={15}/></button>
      )}
      <div style={{ flex:1 }}>
        <h3 style={{ fontWeight:700, fontSize:17, color:'#fff' }}>{title}</h3>
        {subtitle && <p style={{ fontSize:12, color:'rgba(134,239,172,0.5)', marginTop:2 }}>{subtitle}</p>}
      </div>
      <button onClick={onClose} style={{
        width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)',
        background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', color:'rgba(255,255,255,0.6)', flexShrink:0,
      }}><X size={15}/></button>
    </div>
  )
}
