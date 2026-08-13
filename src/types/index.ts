export interface AppState {
  user: { id: number; name: string }
  bio_balance: number
  eth_balance: number
  energy: number
  energy_max: number
  energy_refill_seconds: number
  bio_price_usd: number
}

export type TaskStatus = 'start' | 'claim' | 'done'

export interface Task {
  id: string
  title: string
  handle: string
  url: string
  icon: 'telegram' | 'twitter'
  reward_bio: number
  reward_eth: number
  status: TaskStatus
}

export interface ReferralStats {
  referral_link: string
  total_referrals: number
  active_referrals: number
  total_earned_bio: number
  reward_per_invite_bio: number
}

export interface Wallet {
  id: string
  name: string
  address: string | null
}

export interface WithdrawEligibility {
  eligible: boolean
  referrals_required: number
  referrals_current: number
  airdrop_date: string
}
