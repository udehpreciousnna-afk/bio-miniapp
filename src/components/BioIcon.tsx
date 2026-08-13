import Image from 'next/image'

export function BioIcon({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 ${size * 0.5}px rgba(242,185,12,0.25)`,
      border: '2px solid rgba(242,185,12,0.4)',
    }}>
      <Image src="/bio-logo.jpg" alt="BIO" width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}
