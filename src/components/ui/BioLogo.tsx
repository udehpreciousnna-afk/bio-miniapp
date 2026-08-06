// BIO Protocol logo — uses the actual green splat icon on dark circle
export function BioLogo({ size = 48, className = '' }: { size?: number; className?: string }) {
  const r = size * 0.5
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 40% 35%, #0f3d1a, #071a0b)',
      border: '1.5px solid rgba(34,197,94,0.35)',
      boxShadow: '0 0 20px rgba(34,197,94,0.2), inset 0 1px 0 rgba(134,239,172,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {/* BIO splat shape */}
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64" fill="none">
        <path d="M32 10 C28 10 24 14 24 18 C24 20 25 22 24 24 C22 26 18 25 16 27 C12 30 12 36 15 39 C17 41 20 41 22 43 C24 46 23 50 26 52 C29 55 34 54 37 52 C39 50 39 47 41 45 C43 43 47 44 49 42 C53 39 53 33 50 30 C48 27 44 27 42 25 C40 22 41 18 39 15 C37 12 34 10 32 10Z"
          fill="#a7f3b0" opacity="0.9"/>
        <path d="M20 22 C16 22 12 26 13 30 C14 33 17 34 17 37 C17 40 14 42 15 45 C16 48 20 49 23 48"
          fill="#bbf7c8" opacity="0.5"/>
        <path d="M44 22 C48 22 52 26 51 30 C50 33 47 34 47 37 C47 40 50 42 49 45 C48 48 44 49 41 48"
          fill="#bbf7c8" opacity="0.5"/>
      </svg>
    </div>
  )
}

// Small icon for token rows
export function BioIcon({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 40% 35%, #0f3d1a, #071a0b)',
      border: '1px solid rgba(34,197,94,0.3)',
      boxShadow: '0 0 12px rgba(34,197,94,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 64 64" fill="none">
        <path d="M32 10 C28 10 24 14 24 18 C24 20 25 22 24 24 C22 26 18 25 16 27 C12 30 12 36 15 39 C17 41 20 41 22 43 C24 46 23 50 26 52 C29 55 34 54 37 52 C39 50 39 47 41 45 C43 43 47 44 49 42 C53 39 53 33 50 30 C48 27 44 27 42 25 C40 22 41 18 39 15 C37 12 34 10 32 10Z"
          fill="#a7f3b0" opacity="0.95"/>
      </svg>
    </div>
  )
}
