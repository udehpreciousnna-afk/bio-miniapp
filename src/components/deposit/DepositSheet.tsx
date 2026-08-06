'use client'
import { useState, useEffect, useRef } from 'react'
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
        width: 200, margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
    }
  }, [address])

  const loadAddress = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id }),
      })
      const data = await res.json()
      if (data.pay_address) setAddress(data.pay_address)
      else setError(data.error || 'Failed to generate deposit address. Check your NOWPayments API key.')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const copyAddr = () => {
    navigator.clipboard.writeText(address)
    setCopied(true); haptic(); setTimeout(() => setCopied(false), 2000)
  }

  const pct = Math.min((user.eth_balance / MIN_ETH) * 100, 100)

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
        backdropFilter:'blur(8px)', zIndex:40, animation:'fadeIn 0.2s ease',
      }}/>

      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background:'linear-gradient(180deg, rgba(5,20,10,0.98) 0%, rgba(3,12,6,0.99) 100%)',
        border:'1px solid rgba(34,197,94,0.2)',
        borderRadius:'24px 24px 0 0',
        maxHeight:'92dvh', overflowY:'auto',
        paddingBottom:'max(24px, env(safe-area-inset-bottom))',
        boxShadow:'0 -20px 60px rgba(0,0,0,0.8)',
        animation:'slideUp 0.32s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 16px', borderBottom:'1px solid rgba(34,197,94,0.08)' }}>
          <div>
            <h3 style={{ fontWeight:700, fontSize:17, color:'#fff' }}>Deposit</h3>
            <p style={{ fontSize:12, color:'rgba(134,239,172,0.5)', marginTop:2 }}>Deposit only Ethereum to this address</p>
          </div>
          <button onClick={onClose} style={{
            width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)',
            background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'rgba(255,255,255,0.6)',
          }}><X size={15}/></button>
        </div>

        <div style={{ padding:'16px 20px 0', display:'flex', flexDirection:'column', gap:14 }}>

          {/* ETH balance + progress */}
          <div style={{ padding:'16px', borderRadius:16, background:'rgba(10,40,20,0.5)', border:'1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <p style={{ fontSize:9, fontWeight:700, color:'rgba(134,239,172,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:5 }}>ETH Balance</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                  <span className="mono" style={{ fontSize:26, fontWeight:800, color:'#fff' }}>{fmtEth(user.eth_balance)}</span>
                  <span style={{ fontSize:13, color:'#a78bfa', fontWeight:600 }}>ETH</span>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:9, fontWeight:700, color:'rgba(134,239,172,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:5 }}>Required</p>
                <span className="mono" style={{ fontSize:18, fontWeight:700, color:'#fff' }}>{MIN_ETH} ETH</span>
              </div>
            </div>
            <div style={{ height:8, borderRadius:4, background:'rgba(10,20,10,0.8)', overflow:'hidden', marginBottom:8 }}>
              <div style={{
                height:'100%', borderRadius:4,
                width:`${pct}%`,
                background: pct >= 100 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #92400e, #f59e0b)',
                transition:'width 0.8s ease',
              }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
              <span style={{ color:'rgba(134,239,172,0.5)' }}>{pct.toFixed(0)}% funded</span>
              {user.eth_balance < MIN_ETH && (
                <span style={{ color:'#fbbf24' }}>Still needed: <span className="mono">{fmtEth(MIN_ETH - user.eth_balance)} ETH</span></span>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{
            display:'flex', alignItems:'flex-start', gap:10, padding:'12px 13px',
            borderRadius:12, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)',
          }}>
            <AlertTriangle size={14} color="#fbbf24" style={{ flexShrink:0, marginTop:1 }}/>
            <p style={{ fontSize:12, color:'rgba(251,191,36,0.85)', lineHeight:1.5 }}>
              <strong>Minimum deposit: 0.01 ETH.</strong> Amounts below the minimum are permanently lost.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'32px 0' }}>
              <Spinner size={36}/>
              <p style={{ color:'rgba(134,239,172,0.5)', fontSize:13 }}>Generating your deposit address…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 13px', borderRadius:12, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={14} color="#f87171" style={{ flexShrink:0, marginTop:1 }}/>
                <p style={{ fontSize:13, color:'#fca5a5' }}>{error}</p>
              </div>
              <button onClick={loadAddress} style={{
                padding:'12px', borderRadius:12, border:'1px solid rgba(34,197,94,0.2)',
                background:'rgba(34,197,94,0.06)', color:'#22c55e',
                fontSize:13, fontWeight:600, cursor:'pointer',
              }}>Retry</button>
            </div>
          )}

          {/* QR + address */}
          {!loading && address && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* QR code — white rounded card like reference */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                <div style={{ padding:16, borderRadius:20, background:'#fff', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
                  <canvas ref={canvasRef}/>
                </div>
                <p style={{ fontSize:12, color:'rgba(134,239,172,0.4)' }}>Scan to get the deposit address</p>
              </div>

              {/* Address box */}
              <div style={{ padding:'16px', borderRadius:16, background:'rgba(10,40,20,0.5)', border:'1px solid rgba(34,197,94,0.15)' }}>
                <p style={{ fontSize:9, fontWeight:700, color:'rgba(134,239,172,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>
                  Deposit Address
                </p>
                <p className="mono" style={{ fontSize:12, color:'#fff', wordBreak:'break-all', lineHeight:1.7, marginBottom:14 }}>
                  {address}
                </p>
                <button onClick={copyAddr} style={{
                  width:'100%', padding:'13px', borderRadius:12, cursor:'pointer',
                  background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)',
                  color:'#22c55e', fontSize:13, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  transition:'all 0.2s',
                }}>
                  {copied ? <><Check size={15}/> Copied!</> : <><Copy size={15}/> Copy Address</>}
                </button>
              </div>

              {/* Warning */}
              <div style={{
                display:'flex', alignItems:'flex-start', gap:10, padding:'12px 13px',
                borderRadius:12, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)',
              }}>
                <AlertTriangle size={14} color="#fbbf24" style={{ flexShrink:0, marginTop:1 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#fbbf24', marginBottom:3 }}>
                    Minimum deposit: 0.01 ETH.
                  </p>
                  <p style={{ fontSize:11, color:'rgba(251,191,36,0.7)', lineHeight:1.4 }}>
                    Amounts below the minimum are permanently lost.
                  </p>
                </div>
              </div>

              {/* Confirmation */}
              <div style={{
                display:'flex', alignItems:'flex-start', gap:10, padding:'12px 13px',
                borderRadius:12, background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)',
                marginBottom:4,
              }}>
                <Shield size={14} color="#22c55e" style={{ flexShrink:0, marginTop:1 }}/>
                <p style={{ fontSize:12, color:'rgba(134,239,172,0.7)', lineHeight:1.5 }}>
                  Credited after <strong style={{ color:'#22c55e' }}>10 confirmations</strong> — typically <strong style={{ color:'#22c55e' }}>1–2 minutes</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
