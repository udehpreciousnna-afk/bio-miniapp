'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export interface ToastData {
  id: number
  title: string
  message: string
}

export function Toast({ toast, index, onDone }: { toast: ToastData; index: number; onDone: () => void }) {
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const closeTimer = setTimeout(() => setClosing(true), 4500)
    return () => clearTimeout(closeTimer)
  }, [toast.id])

  useEffect(() => {
    if (!closing) return
    const removeTimer = setTimeout(onDone, 300) // matches toast-out duration
    return () => clearTimeout(removeTimer)
  }, [closing, onDone])

  return (
    <div
      className={closing ? 'toast-out' : 'toast-in'}
      style={{
        position: 'fixed', top: `calc(max(16px, env(safe-area-inset-top)) + ${index * 76}px)`, left: '50%',
        zIndex: 100, width: 'min(92vw, 420px)', transition: 'top 0.25s ease',
      }}
    >
      <div className="glass glow-strong" style={{
        borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
        borderColor: 'rgba(34,197,94,0.4)',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={19} color="#4ade80" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{toast.title}</p>
          <p style={{ fontSize: 13, color: 'rgba(134,239,172,0.75)', marginTop: 2, lineHeight: 1.4 }}>{toast.message}</p>
        </div>
        <button onClick={() => setClosing(true)} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0, padding: 2,
        }}>
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
