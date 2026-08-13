export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

declare global {
  interface Window {
    Telegram?: { WebApp: {
      initData: string
      initDataUnsafe: { user?: TelegramUser; hash: string; auth_date: number }
      ready: () => void; expand: () => void; close: () => void
      openTelegramLink: (url: string) => void
      openLink: (url: string) => void
      showAlert: (message: string, callback?: () => void) => void
      HapticFeedback: {
        impactOccurred: (s:'light'|'medium'|'heavy') => void
        notificationOccurred: (t:'error'|'success'|'warning') => void
      }
    }}
  }
}

export function getTelegramWebApp() { return typeof window !== 'undefined' ? window.Telegram?.WebApp ?? null : null }
export function getTelegramUser(): TelegramUser|null { return getTelegramWebApp()?.initDataUnsafe?.user ?? null }
export function getInitData(): string { return getTelegramWebApp()?.initData ?? '' }
export function initTelegramApp() { const t = getTelegramWebApp(); if (!t) return; t.ready(); t.expand() }
export function haptic(s: 'light'|'medium'|'heavy'='light') { getTelegramWebApp()?.HapticFeedback.impactOccurred(s) }
export function hapticSuccess() { getTelegramWebApp()?.HapticFeedback.notificationOccurred('success') }
export function hapticError() { getTelegramWebApp()?.HapticFeedback.notificationOccurred('error') }
export function showAlert(message: string) {
  const t = getTelegramWebApp()
  if (t) t.showAlert(message)
  else if (typeof window !== 'undefined') window.alert(message)
}
// Opens an external/Telegram link — used by task "Start" buttons
export function openLink(url: string) {
  const t = getTelegramWebApp()
  if (!t) { window.open(url, '_blank'); return }
  if (url.includes('t.me/')) t.openTelegramLink(url)
  else t.openLink(url)
}
