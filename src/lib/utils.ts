import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function shortAddr(addr: string, h = 6, t = 4) {
  if (!addr || addr.length < h + t + 3) return addr
  return `${addr.slice(0, h)}...${addr.slice(-t)}`
}
export function fmtBio(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
}
export function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n)
}
export function fmtEth(n: number) { return n.toFixed(4) }
export function fmtDate(s: string) {
  return new Date(s).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
