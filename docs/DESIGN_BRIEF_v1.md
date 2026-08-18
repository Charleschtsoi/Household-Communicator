# Household Communicator — Design Brief v1 (Locked)

Status: V1 product lock · IA draft · cost-tracking still open (2026-08-18)

Notion: [Design Brief v1 — Locked](https://app.notion.com/p/3c07161f126181dda618c3dcf3e74cab)

## Locked decisions

| # | Topic | Decision |
|---|--------|----------|
| 1 | Primary job | Shared shopping / “what we need” is the hero; presence is secondary |
| 2 | Household | Family, partners, roommates who share household needs and cost |
| 3 | Core pains | Duplicate buys; forgotten needs; hard to know who pays most |
| 4 | Needs model | Shared list + categories + quantity + claim/who’s buying + recurring staples |
| 5 | Presence | Free-text place + optional “back by” + soft statuses (`out`, `home soon`); hour-ish plans OK; **no GPS, no live map, no forced ETA** |
| 6 | Notifications | Ping only when something is marked urgent |
| 7 | Platform / i18n | Mobile web first + desktop; English + Traditional Chinese |
| 8 | Brand | Keep “Household Communicator” |
| 9 | Exclusions | No chores, gamification, chat, GPS, clinical/care features |
| 10 | 60s success | Add household members + tell them what needs buying |

## Product one-liner

Household Communicator is a mobile-web household board for shared purchase needs—who’s buying what—with optional “I’m out / back by” notes. No tracking. No chore police.

## Jobs to be done

1. **When** we run out of something, **I want to** put it on a shared list with qty/category so **we don’t** forget or buy twice.
2. **When** I’m heading to the store, **I want to** claim items so **others know** I’m covering them.
3. **When** something is urgent, **I want** the household pinged—not for every milk carton.
4. **When** I leave the house, **I may want to** share where / when back—without being forced.

## Open blocker — cost fairness

Pain #3 (“who pays most”) is real but **not locked into V1 UX**. Choose one:

- **A — Defer:** V1.1; no spend UI now
- **B — Light:** optional amount + note when marking Bought; simple “this month” totals per member
- **C — Full ledger:** receipts, splits, balances in V1 (heavier; risks delaying the 60s shopping promise)

Recommendation: **B** if cost must address the stated pain; **A** if shipping the shopping loop first matters more.

## V1 exclusions (confirmed)

Chores · points/gamification · chat threads · GPS / live maps · forced ETA · clinical / elderly-care features
EOF