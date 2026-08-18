# Household Communicator — IA & Wireframes v1.1

Companion to `DESIGN_BRIEF_v1.md`. Mobile-first; desktop = wider single column.

## Information architecture

```
Onboarding
  Welcome (EN|繁中) → Create household → Invite → First need → Today

App shell
  Today | Needs | Household
  Presence sheet (from Today)
  Bought sheet (from Needs row)
```

## Screen updates (round 2)

### N1 — Needs
- Actions: **Claim** | **Reassign** (when claimed) | **Bought** | Edit
- Filters: Open | Claimed | Recurring  
- Bought filter is **not** on the open list (archives immediately). History lives for DB/cost later; V1 surfaces cost via monthly totals, not a full bought feed.

### N3 — Mark Bought (locked cost-light)
- Who bought (default claimer / self)
- Optional amount + currency
- Confirm → archive off open list
- If recurring → schedule next open instance

### H1 — Household
- Members + invite
- **This month** contribution strip: per-member sum of logged amounts + household total
- Empty amounts don’t count; unlabeled buys still archive

### Claim / reassign
- One active claim
- Reassign opens member picker; previous claimer cleared

### Recurring
- Cadences: weekly / biweekly / monthly
- Auto-reopen after Bought on schedule

### Categories
Groceries · Household · Personal · Other

### Urgent
Anyone may toggle; save/urgent-on → household ping

## Round-3 locks

- Default currency: **HKD**
- Monthly totals: **calendar month**
- Invite: **link + code**, webpage join
- Max members: **10**
- Empty Today: **push Add need**
- Brand: English product name only (UI still EN + 繁中)

## Visual — warmer home
Soft peach mist + leaf green atmosphere; deep teal accent; soft apricot highlights; friendly UI grotesque + distinctive brand display. See `wireframes/index.html` and Figma hi-fi.

## Figma
https://www.figma.com/design/pQsMRDfj2A0gfs8aSO2tTO/Household-Communicator-Hi-fi-v1
EOF