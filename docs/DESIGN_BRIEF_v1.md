# Household Communicator — Design Brief v1.2 (Locked)

Status: V1 product + product rules locked · Figma hi-fi live (2026-08-18)

Notion: [Design Brief](https://app.notion.com/p/3c07161f126181dda618c3dcf3e74cab)

## Product one-liner

Household Communicator is a **webpage** (mobile-web first + desktop) household board for shared purchase needs—who’s buying what—with optional amounts, calendar-month spend totals (HKD), and optional “I’m out / back by” notes. No tracking. No chore police.

## Locked decisions (rounds 1–3)

| Topic | Decision |
|--------|----------|
| Primary job | Shared shopping / “what we need”; presence secondary |
| Household | Family, partners, roommates sharing needs + cost · **max 10 members** |
| Needs model | Categories · qty · claim (reassignable) · recurring auto-reopen · urgent |
| Categories V1 | Groceries / Household / Personal / Other |
| Claim | Single claim; reassignable |
| Urgent | Anyone → household ping |
| Bought | Archive off open list immediately; keep record/cost |
| Recurring | Auto-reopen on schedule |
| Cost | Light: optional amount on Bought + **calendar-month** totals |
| Currency default | **HKD** |
| Presence | Free-text place + optional back-by + soft status; no GPS/map/forced ETA |
| Notifications | Urgent needs only |
| Invite | **Link + code** (web join flow) |
| Empty Today | **Push Add need** (not a passive empty state) |
| Platform | Webpage · mobile first + desktop |
| i18n | EN + 繁體中文 UI · **product name stays English** |
| Brand | Household Communicator |
| Visual | Warmer home |
| Exclusions | Chores, gamification, chat, GPS, clinical |

## Cost-light rules

1. Mark Bought: who bought + optional amount; currency defaults to **HKD**.
2. Skipping amount allowed (still archives).
3. **This calendar month** totals per member + household total (household timezone later if needed; V1 assume creator locale).
4. No splits / IOUs / settlement in V1.

## Invite (web)

- Short code **and** shareable link
- Join is webpage-based (no native app required for V1)

## Empty Today

When there are no urgent/open needs and no shared presence: primary CTA **Add need** (and secondary invite if household < 2).

## Cap

Household membership hard-stops at **10**. Invite UI disables with a clear message when full.

## Figma

https://www.figma.com/design/pQsMRDfj2A0gfs8aSO2tTO/Household-Communicator-Hi-fi-v1

Frames: O1 Welcome · O2 Create · O3 Invite · O4 First need · T1 Today · **T1b Today empty → Add need** · N1 Needs · N3 Mark Bought · P1 Presence · H1 Household · Cover · Round-3 note

## 60s success

Create household → invite via link/code → add first need.
