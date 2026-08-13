'use client'
import { Users, ClipboardCheck, Wallet as WalletIcon } from 'lucide-react'
import { BioIcon } from './BioIcon'

export type Tab = 'refer' | 'task' | 'tap' | 'wallet'

export function BottomNav({ tab, onChange, taskBadge, walletBadge }: {
  tab: Tab; onChange: (t: Tab) => void; taskBadge?: boolean; walletBadge?: boolean
}) {
  const items: { id: Tab; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'refer', label: 'Refer', icon: <Users size={22} /> },
    { id: 'task', label: 'Task', icon: <ClipboardCheck size={22} />, badge: taskBadge },
    { id: 'tap', label: 'Tap', icon: <BioIcon size={26} /> },
    { id: 'wallet', label: 'Wallet', icon: <WalletIcon size={22} />, badge: walletBadge },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
      background: 'rgba(8,9,14,0.95)', borderTop: '1px solid rgba(242,185,12,0.1)',
      backdropFilter: 'blur(10px)',
    }}>
      {items.map(it => (
        <button key={it.id} onClick={() => onChange(it.id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
          color: tab === it.id ? 'var(--gold)' : 'rgba(255,255,255,0.4)', padding: '4px 14px',
        }}>
          {it.badge && <span style={{ position: 'absolute', top: 0, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />}
          {it.icon}
          <span style={{ fontSize: 11, fontWeight: 600 }}>{it.label}</span>
        </button>
      ))}
    </div>
  )
}
