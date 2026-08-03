import { NextRequest, NextResponse } from 'next/server'
const PHP_BASE   = process.env.NEXT_PUBLIC_API_BASE!
const PHP_SECRET = process.env.PHP_SYNC_SECRET || process.env.BOT_TOKEN!

export async function POST(req: NextRequest) {
  const { password, id, status, tx_hash, notes } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const res = await fetch(`${PHP_BASE}/admin/update_withdrawal.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Bot-Secret': PHP_SECRET },
      body: JSON.stringify({ id, status, tx_hash, notes }),
    })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Backend error' }, { status: 500 })
  }
}
