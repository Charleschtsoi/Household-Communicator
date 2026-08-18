import { promises as fs } from "fs";
import path from "path";
import { customAlphabet } from "nanoid";
import type {
  Category,
  Db,
  Household,
  Locale,
  Member,
  Need,
  Presence,
  PresenceStatus,
  RecurringCadence,
} from "./types";
import { MAX_HOUSEHOLD_MEMBERS } from "./types";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);
const inviteCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join("/tmp", "household-communicator") : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

type GlobalStore = { __hcDb?: Db; __hcWriteChain?: Promise<void> };
const g = globalThis as typeof globalThis & GlobalStore;

const emptyDb = (): Db => ({
  households: [],
  members: [],
  needs: [],
  presence: [],
});

function cloneDb(db: Db): Db {
  return JSON.parse(JSON.stringify(db)) as Db;
}

async function ensureStore() {
  if (isVercel) {
    if (!g.__hcDb) g.__hcDb = emptyDb();
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(emptyDb(), null, 2), "utf8");
  }
}

async function readDb(): Promise<Db> {
  await ensureStore();
  if (isVercel) return cloneDb(g.__hcDb ?? emptyDb());
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as Db;
}

async function writeDb(db: Db) {
  await ensureStore();
  if (isVercel) {
    g.__hcDb = cloneDb(db);
    // Best-effort mirror to /tmp for warm-instance continuity
    g.__hcWriteChain = (g.__hcWriteChain ?? Promise.resolve())
      .catch(() => undefined)
      .then(async () => {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(db), "utf8");
      });
    await g.__hcWriteChain;
    return;
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

function addMonths(iso: string, months: number) {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function nextRecurringDate(fromIso: string, cadence: RecurringCadence) {
  if (cadence === "weekly") return addDays(fromIso, 7);
  if (cadence === "biweekly") return addDays(fromIso, 14);
  return addMonths(fromIso, 1);
}

export async function createHousehold(input: {
  householdName: string;
  displayName: string;
  locale: Locale;
}) {
  const db = await readDb();
  const now = new Date().toISOString();
  const household: Household = {
    id: nanoid(),
    name: input.householdName.trim(),
    inviteCode: inviteCode(),
    currency: "HKD",
    createdAt: now,
  };
  const member: Member = {
    id: nanoid(),
    householdId: household.id,
    displayName: input.displayName.trim(),
    role: "owner",
    locale: input.locale,
    createdAt: now,
  };
  db.households.push(household);
  db.members.push(member);
  await writeDb(db);
  return { household, member };
}

export async function joinHousehold(input: {
  inviteCode: string;
  displayName: string;
  locale: Locale;
}) {
  const db = await readDb();
  const code = input.inviteCode.trim().toUpperCase();
  const household = db.households.find((h) => h.inviteCode === code);
  if (!household) throw new Error("INVITE_NOT_FOUND");
  const count = db.members.filter((m) => m.householdId === household.id).length;
  if (count >= MAX_HOUSEHOLD_MEMBERS) throw new Error("HOUSEHOLD_FULL");
  const member: Member = {
    id: nanoid(),
    householdId: household.id,
    displayName: input.displayName.trim(),
    role: "member",
    locale: input.locale,
    createdAt: new Date().toISOString(),
  };
  db.members.push(member);
  await writeDb(db);
  return { household, member };
}

export async function getHouseholdBundle(householdId: string) {
  const db = await readDb();
  const household = db.households.find((h) => h.id === householdId);
  if (!household) return null;
  const members = db.members.filter((m) => m.householdId === householdId);
  const needs = db.needs
    .filter((n) => n.householdId === householdId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const presence = db.presence.filter((p) => p.householdId === householdId);
  return { household, members, needs, presence };
}

export async function getMember(memberId: string) {
  const db = await readDb();
  return db.members.find((m) => m.id === memberId) ?? null;
}

export async function addNeed(input: {
  householdId: string;
  createdById: string;
  name: string;
  quantity: number;
  category: Category;
  urgent: boolean;
  recurringCadence: RecurringCadence | null;
  notes?: string;
}) {
  const db = await readDb();
  const need: Need = {
    id: nanoid(),
    householdId: input.householdId,
    name: input.name.trim(),
    quantity: input.quantity,
    category: input.category,
    status: "open",
    claimedById: null,
    urgent: input.urgent,
    recurringCadence: input.recurringCadence,
    notes: input.notes?.trim() || null,
    createdById: input.createdById,
    boughtAt: null,
    boughtById: null,
    amount: null,
    createdAt: new Date().toISOString(),
  };
  db.needs.push(need);
  await writeDb(db);
  return need;
}

export async function claimNeed(needId: string, memberId: string) {
  const db = await readDb();
  const need = db.needs.find((n) => n.id === needId);
  if (!need || need.status === "bought") throw new Error("NEED_NOT_CLAIMABLE");
  need.status = "claimed";
  need.claimedById = memberId;
  await writeDb(db);
  return need;
}

export async function reassignNeed(needId: string, memberId: string | null) {
  const db = await readDb();
  const need = db.needs.find((n) => n.id === needId);
  if (!need || need.status === "bought") throw new Error("NEED_NOT_REASSIGNABLE");
  if (!memberId) {
    need.status = "open";
    need.claimedById = null;
  } else {
    need.status = "claimed";
    need.claimedById = memberId;
  }
  await writeDb(db);
  return need;
}

export async function markBought(input: {
  needId: string;
  boughtById: string;
  amount: number | null;
}) {
  const db = await readDb();
  const need = db.needs.find((n) => n.id === input.needId);
  if (!need || need.status === "bought") throw new Error("NEED_NOT_BUYABLE");
  const now = new Date().toISOString();
  need.status = "bought";
  need.boughtAt = now;
  need.boughtById = input.boughtById;
  need.amount = input.amount;
  need.claimedById = null;

  if (need.recurringCadence) {
    const next: Need = {
      ...need,
      id: nanoid(),
      status: "open",
      claimedById: null,
      urgent: false,
      boughtAt: null,
      boughtById: null,
      amount: null,
      createdAt: nextRecurringDate(now, need.recurringCadence),
    };
    // Keep createdAt as schedule marker; also stamp a real open time for sorting
    next.createdAt = now;
    db.needs.push(next);
  }

  await writeDb(db);
  return need;
}

export async function setPresence(input: {
  memberId: string;
  householdId: string;
  status: PresenceStatus;
  placeText: string | null;
  backBy: string | null;
}) {
  const db = await readDb();
  const existing = db.presence.find((p) => p.memberId === input.memberId);
  const row: Presence = {
    memberId: input.memberId,
    householdId: input.householdId,
    status: input.status,
    placeText: input.placeText,
    backBy: input.backBy,
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, row);
  else db.presence.push(row);
  await writeDb(db);
  return row;
}

export async function clearPresence(memberId: string) {
  const db = await readDb();
  const existing = db.presence.find((p) => p.memberId === memberId);
  if (!existing) return null;
  existing.status = "home";
  existing.placeText = null;
  existing.backBy = null;
  existing.updatedAt = new Date().toISOString();
  await writeDb(db);
  return existing;
}

export async function setMemberLocale(memberId: string, locale: Locale) {
  const db = await readDb();
  const member = db.members.find((m) => m.id === memberId);
  if (!member) throw new Error("MEMBER_NOT_FOUND");
  member.locale = locale;
  await writeDb(db);
  return member;
}

export function monthSpendTotals(
  needs: Need[],
  members: Member[],
  now = new Date(),
) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const totals: Record<string, number> = {};
  for (const member of members) totals[member.id] = 0;
  let householdTotal = 0;
  for (const need of needs) {
    if (need.status !== "bought" || need.amount == null || !need.boughtAt || !need.boughtById)
      continue;
    const d = new Date(need.boughtAt);
    if (d.getFullYear() !== y || d.getMonth() !== m) continue;
    totals[need.boughtById] = (totals[need.boughtById] ?? 0) + need.amount;
    householdTotal += need.amount;
  }
  return { totals, householdTotal };
}
