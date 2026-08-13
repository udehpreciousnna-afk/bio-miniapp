import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function fmtBio(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: n < 1000 ? 3 : 0 }).format(n ?? 0)
}
export function fmtEth(n: number) { return (n ?? 0).toFixed(4) }
export function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n ?? 0)
}
export function shortAddr(addr: string, h = 6, t = 6) {
  if (!addr || addr.length < h + t + 3) return addr
  return `${addr.slice(0, h)}...${addr.slice(-t)}`
}
export function fmtCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
}
