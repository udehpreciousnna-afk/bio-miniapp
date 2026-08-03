import { NextResponse } from 'next/server'
const PHP_BASE = process.env.NEXT_PUBLIC_API_BASE!

export async function GET() {
  try {
    const res  = await fetch(`${PHP_BASE}/api/prices.php`, { next: { revalidate: 60 } })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ bio: 0, eth: 0 })
  }
}
