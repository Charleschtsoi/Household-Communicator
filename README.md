# Household Communicator

Mobile-web household board for **shared purchase needs** (hero), optional **out / back-by** presence, and light **HKD calendar-month** spend totals.

## Run

```bash
npm install
cp .env.example .env.local   # optional: add DATABASE_URL for Neon
npm run dev
```

Open http://localhost:3000

## 60s path

1. Create household + your name  
2. Copy invite link/code  
3. Add first need  
4. Use Today / Needs / Record / Household  

## Stack

- Next.js App Router + TypeScript + Tailwind  
- Cookie session (`hc_session` — display name, no OAuth yet)  
- **Durable store:** Neon Postgres when `DATABASE_URL` is set  
- Fallback without DB: `data/store.json` locally, or httpOnly cookie on Vercel  
- EN + 繁體中文 UI · English product name  

## Neon (durable multi-device)

1. Open your Neon project → **Dashboard → Connection details**  
2. Copy the **pooled** connection string (`…-pooler…`)  
3. Set it as `DATABASE_URL`:
   - Local: `.env.local`
   - Vercel: Project → Settings → Environment Variables → Production (and Preview)
4. Redeploy. Tables are created automatically on first request (`sql/schema.sql`).

With Neon, invite codes work across browsers/devices — no cookie bootstrap needed.

## Deploy (Vercel)

```bash
npx vercel --prod
```

Required for shared family data: `DATABASE_URL` pointing at Neon.

## Design

- [Design brief](docs/DESIGN_BRIEF_v1.md)
- [IA & wireframes](docs/IA_AND_WIREFRAMES_v1.md)
- [Lo-fi HTML](wireframes/index.html)
- [Figma hi-fi](https://www.figma.com/design/pQsMRDfj2A0gfs8aSO2tTO/Household-Communicator-Hi-fi-v1)
