export function BioLogo({ size = 40 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.4,
      background: 'linear-gradient(135deg, #0f3d1f, #1a5c2a)',
      border: '1.5px solid rgba(34,197,94,0.3)',
      boxShadow: '0 0 20px rgba(34,197,94,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="4.5" fill="#22c55e"/>
        <path d="M18 13.5C18 10.5 15.5 7 11 7C11 11.5 13.5 13.5 15 14.5" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M22.5 16C25.2 14.5 28.5 15 29.5 19.5C25.5 20.5 23 19 21.5 17.5" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M13.5 20C11 22.5 11 26 15 28C17 24.5 16.5 22 15.5 20.5" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M22.5 20C25 22.5 25 26 21 28C19 24.5 19.5 22 20.5 20.5" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="18" cy="18" r="2.2" fill="#060d06"/>
        <circle cx="18" cy="18" r="1" fill="#22c55e"/>
      </svg>
    </div>
  )
}
