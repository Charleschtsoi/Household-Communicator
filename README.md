# Household Communicator

An iOS app for families to share **chores**, **schedules**, and **shopping lists** in one place.

## Why this app

Households juggle the same three questions every week:

1. Who is doing which chores?
2. What is happening when?
3. What do we need to buy?

Household Communicator keeps those answers visible to everyone in the same family.

## Features (MVP)

| Area | What you can do |
|------|-----------------|
| **Chores** | Create tasks, assign a family member, mark done |
| **Schedule** | Add shared events with date/time and who is involved |
| **Shopping** | Add items, check them off, clear completed |
| **Family** | See household members and switch the “acting as” person |

Data is stored **on-device** for the first version (in-memory + `UserDefaults` persistence). Sync across devices can be added later (CloudKit, Firebase, or a custom backend).

## Requirements

- macOS with **Xcode 15+**
- iOS **17.0+** deployment target
- Swift **5.9+** / SwiftUI

## Open the project

```bash
open HouseholdCommunicator/HouseholdCommunicator.xcodeproj
```

Then choose an iPhone simulator (or a physical device) and press **Run** (⌘R).

### First-time setup in Xcode

1. Open `HouseholdCommunicator.xcodeproj`.
2. Select the **HouseholdCommunicator** target → **Signing & Capabilities**.
3. Choose your Team / signing certificate.
4. Build and run.

If you prefer to recreate the Xcode project from the sources:

1. File → New → Project → **App** (iOS).
2. Product Name: `HouseholdCommunicator`, Interface: **SwiftUI**, Language: **Swift**.
3. Replace the generated `ContentView.swift` / `*App.swift` with the files under `HouseholdCommunicator/HouseholdCommunicator/`.
4. Ensure the deployment target is **iOS 17.0**.

## App structure

```
HouseholdCommunicator/
├── HouseholdCommunicator.xcodeproj
└── HouseholdCommunicator/
    ├── HouseholdCommunicatorApp.swift   # App entry
    ├── ContentView.swift                # Tab shell
    ├── Models/
    │   ├── FamilyMember.swift
    │   ├── Chore.swift
    │   ├── ScheduleEvent.swift
    │   └── ShoppingItem.swift
    ├── Stores/
    │   └── HouseholdStore.swift         # Shared state + persistence
    ├── Views/
    │   ├── ChoresView.swift
    │   ├── ScheduleView.swift
    │   ├── ShoppingView.swift
    │   └── FamilyView.swift
    └── Assets.xcassets/
```

## How to use (demo flow)

1. Open **Family** and note the sample members (or add your own).
2. Set **Acting as** to the person whose actions you want to record.
3. Add chores on **Chores**, assign them, and toggle completion.
4. Add shared events on **Schedule**.
5. Build a grocery list on **Shopping** and check items off at the store.

## Design notes

- **One household, many members** — every list item can be tied to a person.
- **“Acting as”** — on a shared device (kitchen iPad), pick who is interacting.
- **Local-first** — works offline; sync is a later milestone.
- **SwiftUI + Observation** — `HouseholdStore` is an `@Observable` source of truth injected via the environment.

## Roadmap

- [ ] iCloud / CloudKit sync for the same Apple Family
- [ ] Push reminders for chores and events
- [ ] Recurring chores and shopping staples
- [ ] Photo attachments on shopping items
- [ ] Widgets for “today’s chores” and “shopping count”
- [ ] Share invite link / household codes

## Privacy

MVP data never leaves the device. When sync is added, document what is stored where and give households a clear export/delete path.

## License

MIT — feel free to fork and adapt for your family.
