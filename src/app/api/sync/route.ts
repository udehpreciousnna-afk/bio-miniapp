// POST /api/sync
// Receives Telegram initData from client, verifies it server-side,
// then syncs the user to the PHP backend and returns user data.
import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'

const BOT_TOKEN   = process.env.BOT_TOKEN!
const PHP_BASE    = process.env.NEXT_PUBLIC_API_BASE!
const PHP_SECRET  = process.env.PHP_SYNC_SECRET || BOT_TOKEN

// Verify Telegram initData signature
function verifyInitData(initData: string): Record<string, string> | null {
  try {
    const params   = new URLSearchParams(initData)
    const hash     = params.get('hash')
    if (!hash) return null

    params.delete('hash')

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest()

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (expectedHash !== hash) return null

    // Check auth_date not older than 1 hour
    const authDate = parseInt(params.get('auth_date') ?? '0')
    if (Date.now() / 1000 - authDate > 3600) return null

    return Object.fromEntries(params.entries())
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { initData } = await req.json()

  if (!initData) {
    return NextResponse.json({ error: 'No initData' }, { status: 400 })
  }

  // Verify Telegram signature server-side
  const data = verifyInitData(initData)
  if (!data) {
    return NextResponse.json({ error: 'Invalid initData' }, { status: 401 })
  }

  const telegramUser = JSON.parse(data.user ?? '{}')
  if (!telegramUser.id) {
    return NextResponse.json({ error: 'No user in initData' }, { status: 400 })
  }

  // Sync to PHP backend
  try {
    const res = await fetch(`${PHP_BASE}/api/sync_user.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bot-Secret': PHP_SECRET,
      },
      body: JSON.stringify({
        user_id:       telegramUser.id,
        telegram_name: `${telegramUser.first_name ?? ''} ${telegramUser.last_name ?? ''}`.trim(),
        username:      telegramUser.username ?? '',
        wallet_address:'',   // bot already syncs wallet; php upsert keeps existing value
        bio_balance:   0,    // php keeps existing value on upsert
        eth_balance:   0,
      }),
    })
    const phpData = await res.json()
    // Return user from PHP
    const userRes = await fetch(`${PHP_BASE}/api/me_by_id.php?uid=${telegramUser.id}`, {
      headers: { 'X-Bot-Secret': PHP_SECRET },
    })
    const user = await userRes.json()
    return NextResponse.json({ success: true, user })
  } catch (e) {
    return NextResponse.json({ error: 'Backend error' }, { status: 500 })
  }
}
