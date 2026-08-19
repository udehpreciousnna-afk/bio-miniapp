import { NextResponse } from 'next/server'
export async function GET() {
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/prices.php`, { next:{ revalidate:60 } })
    return NextResponse.json(await r.json())
  } catch { return NextResponse.json({ bio:0, eth:0 }) }
}
