import { NextRequest, NextResponse } from 'next/server'
const PHP_BASE   = process.env.NEXT_PUBLIC_API_BASE!
const PHP_SECRET = process.env.PHP_SYNC_SECRET || process.env.BOT_TOKEN!

export async function POST(req: NextRequest) {
  const { user_id, address, amount } = await req.json()
  if (!user_id || !address || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const res = await fetch(`${PHP_BASE}/api/withdraw_by_id.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Bot-Secret': PHP_SECRET },
      body: JSON.stringify({ user_id, address, amount }),
    })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Backend error' }, { status: 500 })
  }
}
