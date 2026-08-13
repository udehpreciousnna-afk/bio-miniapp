# BIO Mining Mini App — Backend API Contract

This app is built against the endpoints below. Your Render backend needs to
expose these exact routes (or tell me what you already have and I'll adjust
`src/lib/api.ts` to match instead — that file is the ONLY place that needs
to change).

Base URL comes from `NEXT_PUBLIC_API_BASE` (set in your deployment env, e.g.
`https://your-app.onrender.com`).

## Auth

Every request sends Telegram's WebApp init data for verification:

```
Authorization: tma <initData>
```

Your backend should validate this the same way any Telegram bot backend
does: HMAC-SHA256 the data-check-string with your bot token, compare hashes,
reject if invalid or older than 1 hour. (I can write this verification for
you in Node/Express or Python/FastAPI if you tell me which your Render
service runs.)

## Endpoints

### `GET /api/state`
Returns everything the Tap screen needs on load.
```json
{
  "user": { "id": 123456, "name": "Alex" },
  "bio_balance": 14.91,
  "eth_balance": 0.0104,
  "energy": 920,
  "energy_max": 1000,
  "energy_refill_seconds": 3557,
  "bio_price_usd": 1.18
}
```
`energy_refill_seconds` = seconds remaining until energy is back to full
(server-authoritative — the client just counts it down visually).

### `POST /api/tap`
Body: `{ "count": 3 }` (client batches rapid taps into one call — always send
the real count, default 1). Server should: clamp to available energy (never
credit more than `energy` allows), decrement energy by the granted count,
credit `bio_balance += granted_count`, persist, return new state.
```json
{ "bio_balance": 15.91, "energy": 919, "energy_refill_seconds": 3550, "granted": 3 }
```
On zero energy: `{ "error": "no_energy" }` (HTTP 400).

### `GET /api/tasks`
```json
{ "tasks": [
  { "id": "telegram_channel", "title": "Join Telegram Channel", "handle": "@TheBioNetwork", "url": "https://t.me/TheBioNetwork", "icon": "telegram", "reward_bio": 1000, "reward_eth": 0.002, "status": "start" },
  { "id": "sponsor_channel",  "title": "Join Sponsor Channel",  "handle": "@SponsorHandle",  "url": "https://t.me/SponsorHandle",  "icon": "telegram", "reward_bio": 1000, "reward_eth": 0.002, "status": "claim" },
  { "id": "twitter",          "title": "Follow Twitter Page",   "handle": "@bionetwork",      "url": "https://x.com/bionetwork",    "icon": "twitter",  "reward_bio": 1000, "reward_eth": 0.002, "status": "done" }
]}
```
`status` is one of `start` (not opened yet) → `claim` (opened, ready to
claim) → `done` (claimed). Your backend decides when `start` flips to
`claim` — commonly either optimistically (client just opened the link) or
by actually checking channel membership via the Bot API's
`getChatMember`. I've built the client to flip to `claim` as soon as the
user taps Start and returns to the app; swap to real membership checks
server-side whenever you're ready, no frontend change needed.

### `POST /api/tasks/:id/claim`
Credits `reward_bio` + `reward_eth` once, marks task `done`, rejects
double-claims.
```json
{ "success": true, "bio_balance": 16016.91, "eth_balance": 0.0124 }
```

### `GET /api/referrals`
```json
{
  "referral_link": "https://t.me/YourBotName?start=ref_123456",
  "total_referrals": 3,
  "active_referrals": 3,
  "total_earned_bio": 9000,
  "reward_per_invite_bio": 3000
}
```

### `GET /api/wallets`
```json
{ "wallets": [
  { "id": "trust_wallet", "name": "Trust Wallet", "address": "0x91e0d9...9b8357" },
  { "id": "binance",      "name": "Binance",      "address": null },
  { "id": "bitget",       "name": "Bitget",       "address": null },
  { "id": "bingx",        "name": "BingX",        "address": null }
]}
```

### `POST /api/wallets/:id/connect`
```json
// body: { "address": "0x..." }
// response:
{ "success": true, "wallets": [ /* updated list */ ] }
```

### `GET /api/withdraw/eligibility`
```json
{
  "eligible": false,
  "referrals_required": 3,
  "referrals_current": 1,
  "airdrop_date": "2026-08-31"
}
```

### `POST /api/withdraw/bio`
```json
// body: { "address": "0x..." }
// response:
{ "success": true } // or { "error": "not_eligible" }
```

## Status

All of this is now implemented on both sides:

- **Python side** (`web_api.py` in your bot repo) — a FastAPI app exposing
  every route below, running in the *same process* as your bot's Telegram
  polling loop (see `bot.py`), so there's only ever one process touching
  `/data/bio_mining.db` — no separate service, no disk-sharing problem.
- **Next.js side** (this repo) — every screen wired to these routes via
  `src/lib/api.ts`.

## What you still need to do

1. Set `NEXT_PUBLIC_API_BASE` in this Next.js project's deployment env to
   your bot's Render service public URL (the same service — there's no
   second URL, since the API now runs alongside the bot).
2. Render will pass a `$PORT` env var automatically for the FastAPI server
   to bind to (`web_api.py`/`bot.py` already read `PORT`) — just make sure
   this Render service is a **Web Service**, not a Background Worker, or
   Render won't route HTTP traffic to it.
3. Tighten `allow_origins=["*"]` in `web_api.py`'s CORS setup to your actual
   deployed Mini App domain once you know it.
