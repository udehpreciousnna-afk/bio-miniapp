import type { TelegramUser } from '@/types'

// Telegram injects window.Telegram.WebApp when opened inside Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
          hash: string
          auth_date: number
        }
        ready: () => void
        expand: () => void
        close: () => void
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (fn: () => void) => void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          onClick: (fn: () => void) => void
          offClick: (fn: () => void) => void
          setText: (text: string) => void
          showProgress: (leaveActive: boolean) => void
          hideProgress: () => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        version: string
        platform: string
      }
    }
  }
}

export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function getTelegramUser(): TelegramUser | null {
  const twa = getTelegramWebApp()
  return twa?.initDataUnsafe?.user ?? null
}

export function getInitData(): string {
  const twa = getTelegramWebApp()
  return twa?.initData ?? ''
}

export function initTelegramApp() {
  const twa = getTelegramWebApp()
  if (!twa) return
  twa.ready()
  twa.expand()
}

export function haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  getTelegramWebApp()?.HapticFeedback.impactOccurred(type)
}

export function hapticSuccess() {
  getTelegramWebApp()?.HapticFeedback.notificationOccurred('success')
}

export function hapticError() {
  getTelegramWebApp()?.HapticFeedback.notificationOccurred('error')
}
