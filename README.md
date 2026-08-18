# Household Communicator

Mobile-web household board for **shared purchase needs** (hero), optional **out / back-by** presence, and light **HKD calendar-month** spend totals.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 60s path

1. Create household + your name  
2. Copy invite link/code  
3. Add first need  
4. Use Today / Needs / Household  

## Stack (V1 MVP assumptions)

- Next.js App Router + TypeScript + Tailwind  
- Cookie session (display name, no OAuth yet)  
- File-backed JSON store in `data/store.json`  
- EN + 繁體中文 UI · English product name  

## Design

- [Design brief](docs/DESIGN_BRIEF_v1.md)
- [IA & wireframes](docs/IA_AND_WIREFRAMES_v1.md)
- [Lo-fi HTML](wireframes/index.html)
- [Figma hi-fi](https://www.figma.com/design/pQsMRDfj2A0gfs8aSO2tTO/Household-Communicator-Hi-fi-v1)
