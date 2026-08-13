'use client'
import { useEffect, useState } from 'react'
import { Link2, Copy, Send, Users, CheckCircle2, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import { haptic, hapticSuccess } from '@/lib/telegram'
import { fmtBio } from '@/lib/utils'
import type { ReferralStats } from '@/types'

export function ReferralScreen() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { api.getReferrals().then(setStats).catch(() => {}) }, [])

  const copyLink = async () => {
    if (!stats?.referral_link) return
    try { await navigator.clipboard.writeText(stats.referral_link); setCopied(true); hapticSuccess(); setTimeout(() => setCopied(false), 1500) } catch {}
  }
  const share = () => {
    if (!stats?.referral_link) return
    haptic()
    const url = `https://t.me/share/url?url=${encodeURIComponent(stats.referral_link)}`
    window.open(url, '_blank')
  }

  if (!stats) return <div style={{ padding: 24, minHeight: '100dvh' }} />

  return (
    <div style={{ padding: '28px 20px 100px', minHeight: '100dvh' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Refer &amp; Earn</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 6, marginBottom: 24 }}>Invite friends and earn more</p>

      <div className="card" style={{ padding: 20, marginBottom: 20, borderColor: 'rgba(242,185,12,0.3)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Per Invite</p>
        <p style={{ fontSize: 34, fontWeight: 800 }}>{fmtBio(stats.reward_per_invite_bio)} <span style={{ color: 'var(--gold)', fontSize: 20 }}>BIO</span></p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Your Referral Link</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
          <Link2 size={16} color="var(--gold)" style={{ flexShrink: 0 }} />
          <span className="mono" style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {stats.referral_link || 'Loading…'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={copyLink} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={share} className="gold-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, fontSize: 14 }}>
            <Send size={16} /> Share
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 8px', display: 'flex' }}>
        {[
          { icon: <Users size={18} color="var(--gold)" />, value: stats.total_referrals, label: 'Total Referrals' },
          { icon: <CheckCircle2 size={18} color="var(--gold)" />, value: stats.active_referrals, label: 'Active Referrals' },
          { icon: <DollarSign size={18} color="var(--gold)" />, value: fmtBio(stats.total_earned_bio), label: 'Total Earned' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(242,185,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{s.icon}</div>
            <p style={{ fontWeight: 800, fontSize: 18 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
