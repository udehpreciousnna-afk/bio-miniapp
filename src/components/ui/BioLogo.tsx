// BIO Protocol logo components
// BioLogo — large header version using the actual logo image
// BioIcon — small token row version using SVG approximation

import Image from 'next/image'

export function BioLogo({ size = 72 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      overflow: 'hidden',
      boxShadow: `0 0 ${size * 0.55}px rgba(34,197,94,0.22), 0 0 ${size * 0.2}px rgba(34,197,94,0.1)`,
      border: '1.5px solid rgba(34,197,94,0.25)',
    }}>
      <Image
        src="/bio-logo.jpg"
        alt="BIO Protocol"
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        priority
      />
    </div>
  )
}

// Small icon for asset rows, token lists, balance cards
export function BioIcon({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      overflow: 'hidden',
      boxShadow: `0 0 ${size * 0.4}px rgba(34,197,94,0.18)`,
      border: '1px solid rgba(34,197,94,0.28)',
    }}>
      <Image
        src="/bio-logo.jpg"
        alt="BIO"
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

// Small icon for asset rows, token lists, balance cards — ETH variant
export function EthIcon({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 ${size * 0.4}px rgba(167,139,250,0.18)`,
      border: '1px solid rgba(167,139,250,0.28)',
      background: 'rgba(167,139,250,0.08)',
    }}>
      <Image
        src="/eth-logo.png"
        alt="ETH"
        width={size}
        height={size}
        style={{ width: '70%', height: '70%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  )
}
