# Household Communicator — Design Brief v1.1 (Locked)

Status: V1 rules locked including cost-light · Figma hi-fi pending MCP auth (2026-08-18)

Notion: [Design Brief](https://app.notion.com/p/3c07161f126181dda618c3dcf3e74cab)

## Product one-liner

Household Communicator is a mobile-web household board for shared purchase needs—who’s buying what—with optional amounts, simple monthly spend totals, and optional “I’m out / back by” notes. No tracking. No chore police.

## Locked decisions (rounds 1–2)

| Topic | Decision |
|--------|----------|
| Primary job | Shared shopping / “what we need”; presence secondary |
| Household | Family, partners, roommates sharing needs + cost |
| Needs model | Categories · qty · claim (reassignable) · recurring auto-reopen · urgent |
| Categories V1 | Groceries / Household / Personal / Other |
| Claim | Single claim; can be **reassigned** to someone else |
| Urgent | **Anyone** can mark urgent → household ping |
| Bought | Leaves open list **immediately**; record + cost kept for history/DB |
| Recurring | **Auto-reopen on schedule** |
| Cost | **Light:** optional amount on Bought + simple monthly totals per member |
| Presence | Free-text place + optional back-by + soft status; no GPS/map/forced ETA |
| Notifications | Urgent needs only |
| Platform / i18n | Mobile web first + desktop; EN + 繁體中文 |
| Brand | Household Communicator |
| Visual | **Warmer home** (inviting domestic utility—not chore-gamification, not purple SaaS) |
| Exclusions | Chores, gamification, chat, GPS, clinical |

## Cost-light rules

1. Mark Bought sheet: who bought (default = claimer or self) + **optional amount** + currency (household default).
2. Skipping amount is allowed (item still archives).
3. **This month** totals on Household: sum of logged amounts per member + household total.
4. No splits, IOUs, or settlement math in V1.
5. Archived bought rows remain queryable for future richer cost views.

## Claim / reassign

- Open → Claim (sets `claimedBy`)
- Claimed → **Reassign** (pick another member) or Claim myself
- Claimed → Bought (archives; optional amount)

## Recurring

- Cadence: weekly / biweekly / monthly
- On Bought: archive current instance; schedule next `open` occurrence automatically

## Visual direction (warmer home)

- Atmosphere: soft peach mist + leaf green (not flat cream + terracotta cliché)
- Accent: deep teal-green; soft apricot for highlights
- Type: friendly grotesque for UI + distinctive display for brand wordmark
- Motion later: soft presence chip fade, list settle on Bought

## Figma

- Hi-fi file: https://www.figma.com/design/pQsMRDfj2A0gfs8aSO2tTO/Household-Communicator-Hi-fi-v1
- Page: Mobile Hi-fi v1
- Frames: O1 Welcome · O2 Create · O3 Invite · O4 First need · T1 Today · N1 Needs · N3 Mark Bought · P1 Presence · H1 Household · Cover

## 60s success

Create household → invite → add first need.
EOF