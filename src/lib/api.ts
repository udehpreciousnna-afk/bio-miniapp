import { getInitData } from './telegram'
import type { AppState, Task, ReferralStats, Wallet, WithdrawEligibility } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_BASE

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error('NEXT_PUBLIC_API_BASE is not set — point this at your Render backend URL.')
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `tma ${getInitData()}`,
      ...(init?.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed: ${path}`)
  return data as T
}

export const api = {
  getState: () => request<AppState>('/api/state'),

  tap: (count = 1) => request<{ bio_balance: number; energy: number; energy_refill_seconds: number; granted: number }>('/api/tap', { method: 'POST', body: JSON.stringify({ count }) }),

  getTasks: () => request<{ tasks: Task[] }>('/api/tasks'),
  claimTask: (id: string) => request<{ success: boolean; bio_balance: number; eth_balance: number }>(`/api/tasks/${id}/claim`, { method: 'POST' }),

  getReferrals: () => request<ReferralStats>('/api/referrals'),

  getWallets: () => request<{ wallets: Wallet[] }>('/api/wallets'),
  connectWallet: (id: string, address: string) =>
    request<{ success: boolean; wallets: Wallet[] }>(`/api/wallets/${id}/connect`, { method: 'POST', body: JSON.stringify({ address }) }),

  getWithdrawEligibility: () => request<WithdrawEligibility>('/api/withdraw/eligibility'),
  withdrawBio: (address: string) => request<{ success: boolean; error?: string }>('/api/withdraw/bio', { method: 'POST', body: JSON.stringify({ address }) }),
}
