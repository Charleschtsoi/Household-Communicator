# Household Communicator — IA & Wireframes v1

Companion to `DESIGN_BRIEF_v1.md`. Mobile-first; desktop is a wider single column, not a dashboard.

## Information architecture

```
Onboarding (first run)
  ├─ Welcome / language (EN | 繁中)
  ├─ Create household (name)
  ├─ Your display name
  ├─ Invite members (link + code)
  └─ Add first need → lands on Today

App shell (after join)
  ├─ Today          ← default home
  ├─ Needs          ← hero surface
  ├─ Household      ← members, invites, settings
  └─ Presence       ← not a primary tab; sheet from Today / profile
```

Bottom nav (mobile): **Today · Needs · Household**  
Presence is a compact strip + sheet, not a fourth tab (secondary job).

---

## Screen inventory

### O1 — Welcome
- Brand: **Household Communicator** (hero-level)
- One line: shared needs, optional “out / back by”
- CTA: Get started
- Language toggle: English | 繁體中文

### O2 — Create household
- Household name
- Your name
- CTA: Create

### O3 — Invite (critical for 60s success)
- Share link + short code
- Copy / system share
- Skip for now (allowed) + “Add what we need” primary

### O4 — First need
- Item name, quantity, category, urgent toggle
- CTA: Add to list → Today

### T1 — Today
Sections (one job each, top → bottom):
1. **Urgent** — only urgent open needs (empty state: calm, no fake urgency)
2. **Presence strip** — members who shared status; “Update mine” opens sheet
3. **Open claims / you’re buying** — items claimed by anyone (or filter “mine”)
4. Soft link: View all needs → Needs

### N1 — Needs (hero)
- Sticky “+ Add need”
- Grouped by category (Groceries, Household, Personal, Other — editable later)
- Row: name · qty · claimed-by avatar/name · urgent chip · recurring icon
- Actions on row: Claim · Bought · Edit
- Filters: Open | Claimed | Bought (recent) | Recurring

### N2 — Add / Edit need (sheet)
Fields:
- Name (required)
- Quantity (default 1)
- Category
- Recurring staple? (cadence: weekly / biweekly / monthly — simple)
- Urgent? (triggers household ping on save if true)
- Notes (optional, short)

### N3 — Mark Bought
- Confirm item + who bought
- **If cost = Light (pending):** optional amount + currency
- Clears claim; item moves to Bought / archive; recurring re-queues next due

### P1 — Presence sheet
- Soft status: Home | Out | Home soon
- Place (free text, optional unless Out/Home soon)
- Back by (optional datetime, hour precision)
- Clear / I’m home
- Copy: “Only what you choose to share. No GPS.”

### H1 — Household
- Member list (name, role)
- Invite again (link/code)
- Roles (proposed): Owner | Member
- Language preference
- Privacy note for presence defaults: off until user posts

---

## 60-second success path

| Sec | Action |
|-----|--------|
| 0–10 | Open → language → Create household + your name |
| 10–35 | Copy invite link / code; send in existing chat |
| 35–60 | Add first need (e.g. Milk ×2, Groceries, optional urgent) |
| Done | Today shows the need; invitee can join and claim later |

Prototype acceptance: a new user can finish O2→O4 without reading a tutorial.

---

## Data objects (design-level)

**Household** — id, name, inviteCode, localeDefault  
**Member** — id, displayName, role, locale  
**Need** — name, qty, category, status(`open`|`claimed`|`bought`), claimedBy, urgent, recurring(cadence|null), createdBy, boughtAt, optionalAmount?  
**Presence** — memberId, status(`home`|`out`|`home_soon`), placeText?, backBy?, updatedAt  

---

## Notification rules

| Event | Notify? |
|-------|---------|
| Need added (not urgent) | No |
| Need marked urgent (create or edit) | Yes — household |
| Need claimed / bought | No (in-app only) |
| Presence updated | No |
| Member joined | Soft in-app on Today only |

---

## Wireframe notes (lo-fi)

See `wireframes/index.html` — clickable mobile frames for O1–O4, T1, N1, P1, H1.

Visual direction (pending separate pass): calm utility, brand-first wordmark, not purple SaaS, not cream-serif lifestyle, not chore-gamification badges.
EOF