import type { WithdrawalStatus } from '@/types'

const cfg: Record<WithdrawalStatus, { label: string; bg: string; color: string }> = {
  pending:    { label: 'Pending',    bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  processing: { label: 'Processing', bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa' },
  completed:  { label: 'Completed',  bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  rejected:   { label: 'Rejected',   bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
  cancelled:  { label: 'Cancelled',  bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' },
}

export function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const { label, bg, color } = cfg[status] ?? cfg.pending
  return (
    <span style={{
      background: bg, color, border: `1px solid ${color}33`,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase', display: 'inline-block',
    }}>
      {label}
    </span>
  )
}
