import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
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
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
export const DB_COOKIE = "hc_db";
const COOKIE_MAX = 3500; // stay under typical 4KB cookie limits

const emptyDb = (): Db => ({
  households: [],
  members: [],
  needs: [],
  presence: [],
});

function cloneDb(db: Db): Db {
  return JSON.parse(JSON.stringify(db)) as Db;
}

function pruneDb(db: Db): Db {
  const next = cloneDb(db);
  const bought = next.needs
    .filter((n) => n.status === "bought")
    .sort((a, b) => (b.boughtAt || "").localeCompare(a.boughtAt || ""));
  const keepBought = new Set(bought.slice(0, 40).map((n) => n.id));
  next.needs = next.needs.filter((n) => n.status !== "bought" || keepBought.has(n.id));
  return next;
}

function encodeDb(db: Db): string {
  return Buffer.from(JSON.stringify(pruneDb(db)), "utf8").toString("base64url");
}

function decodeDb(raw: string | undefined): Db | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Db;
    if (!parsed.households || !parsed.members || !parsed.needs || !parsed.presence) return null;
    return parsed;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw)) as Db;
    } catch {
      return null;
    }
  }
}

async function readDb(): Promise<Db> {
  if (isVercel) {
    const jar = await cookies();
    return cloneDb(decodeDb(jar.get(DB_COOKIE)?.value) ?? emptyDb());
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Db;
  } catch {
    const db = emptyDb();
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

async function writeDb(db: Db) {
  const pruned = pruneDb(db);
  if (isVercel) {
    const jar = await cookies();
    let payload = encodeDb(pruned);
    // If still too large, drop older bought rows more aggressively
    if (payload.length > COOKIE_MAX) {
      pruned.needs = pruned.needs.filter((n) => n.status !== "bought").concat(
        pruned.needs
          .filter((n) => n.status === "bought")
          .sort((a, b) => (b.boughtAt || "").localeCompare(a.boughtAt || ""))
          .slice(0, 10),
      );
      payload = encodeDb(pruned);
    }
    jar.set(DB_COOKIE, payload, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
      maxAge: 60 * 60 * 24 * 180,
    });
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(pruned, null, 2), "utf8");
}

export async function clearDbCookie() {
  if (!isVercel) return;
  const jar = await cookies();
  jar.delete(DB_COOKIE);
}

export function exportHouseholdBootstrap(db: Db, householdId: string): string {
  const household = db.households.find((h) => h.id === householdId);
  if (!household) return "";
  const slice: Db = {
    households: [household],
    members: db.members.filter((m) => m.householdId === householdId),
    needs: db.needs.filter((n) => n.householdId === householdId && n.status !== "bought"),
    presence: db.presence.filter((p) => p.householdId === householdId),
  };
  return encodeDb(slice);
}

export async function importHouseholdBootstrap(raw: string) {
  const incoming = decodeDb(raw);
  if (!incoming || incoming.households.length === 0) throw new Error("BAD_BOOTSTRAP");
  const db = await readDb();
  for (const h of incoming.households) {
    if (!db.households.some((x) => x.id === h.id)) db.households.push(h);
  }
  for (const m of incoming.members) {
    if (!db.members.some((x) => x.id === m.id)) db.members.push(m);
  }
  for (const n of incoming.needs) {
    if (!db.needs.some((x) => x.id === n.id)) db.needs.push(n);
  }
  for (const p of incoming.presence) {
    const idx = db.presence.findIndex((x) => x.memberId === p.memberId);
    if (idx >= 0) db.presence[idx] = p;
    else db.presence.push(p);
  }
  await writeDb(db);
  return incoming.households[0];
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
  bootstrap?: string | null;
}) {
  if (input.bootstrap) {
    try {
      await importHouseholdBootstrap(input.bootstrap);
    } catch {
      // continue; may already exist via invite code in local store
    }
  }
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
  return { household, members, needs, presence, bootstrap: exportHouseholdBootstrap(db, householdId) };
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
      createdAt: now,
    };
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
