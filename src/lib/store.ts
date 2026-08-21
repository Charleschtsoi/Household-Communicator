import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { customAlphabet } from "nanoid";
import { ensureSchema, getSql, hasDatabaseUrl } from "./db";
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
const COOKIE_MAX = 3500;

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

function iso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function mapHousehold(row: Record<string, unknown>): Household {
  return {
    id: String(row.id),
    name: String(row.name),
    inviteCode: String(row.invite_code),
    currency: "HKD",
    createdAt: iso(row.created_at as Date | string) || new Date().toISOString(),
  };
}

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: String(row.id),
    householdId: String(row.household_id),
    displayName: String(row.display_name),
    role: row.role === "owner" ? "owner" : "member",
    locale: row.locale === "zh-Hant" ? "zh-Hant" : "en",
    createdAt: iso(row.created_at as Date | string) || new Date().toISOString(),
  };
}

function mapNeed(row: Record<string, unknown>): Need {
  const cadence = row.recurring_cadence;
  return {
    id: String(row.id),
    householdId: String(row.household_id),
    name: String(row.name),
    quantity: Number(row.quantity) || 1,
    category: String(row.category) as Category,
    status: String(row.status) as Need["status"],
    claimedById: row.claimed_by_id ? String(row.claimed_by_id) : null,
    urgent: Boolean(row.urgent),
    recurringCadence: cadence ? (String(cadence) as RecurringCadence) : null,
    notes: row.notes ? String(row.notes) : null,
    createdById: String(row.created_by_id),
    boughtAt: iso(row.bought_at as Date | string | null),
    boughtById: row.bought_by_id ? String(row.bought_by_id) : null,
    amount: row.amount == null ? null : Number(row.amount),
    createdAt: iso(row.created_at as Date | string) || new Date().toISOString(),
  };
}

function mapPresence(row: Record<string, unknown>): Presence {
  return {
    memberId: String(row.member_id),
    householdId: String(row.household_id),
    status: String(row.status) as PresenceStatus,
    placeText: row.place_text ? String(row.place_text) : null,
    backBy: row.back_by ? String(row.back_by) : null,
    updatedAt: iso(row.updated_at as Date | string) || new Date().toISOString(),
  };
}

/** ---------- Local / cookie fallback (no DATABASE_URL) ---------- */

async function readLocalDb(): Promise<Db> {
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

async function writeLocalDb(db: Db) {
  const pruned = pruneDb(db);
  if (isVercel) {
    const jar = await cookies();
    let payload = encodeDb(pruned);
    if (payload.length > COOKIE_MAX) {
      pruned.needs = pruned.needs
        .filter((n) => n.status !== "bought")
        .concat(
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
  if (!isVercel || hasDatabaseUrl()) return;
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
  if (hasDatabaseUrl()) return null;
  const incoming = decodeDb(raw);
  if (!incoming || incoming.households.length === 0) throw new Error("BAD_BOOTSTRAP");
  const db = await readLocalDb();
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
  await writeLocalDb(db);
  return incoming.households[0];
}

/** ---------- Neon-backed operations ---------- */

export async function createHousehold(input: {
  householdName: string;
  displayName: string;
  locale: Locale;
}) {
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

  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO households (id, name, invite_code, currency, created_at)
      VALUES (${household.id}, ${household.name}, ${household.inviteCode}, ${household.currency}, ${household.createdAt})
    `;
    await sql`
      INSERT INTO members (id, household_id, display_name, role, locale, created_at)
      VALUES (${member.id}, ${member.householdId}, ${member.displayName}, ${member.role}, ${member.locale}, ${member.createdAt})
    `;
    return { household, member };
  }

  const db = await readLocalDb();
  db.households.push(household);
  db.members.push(member);
  await writeLocalDb(db);
  return { household, member };
}

export async function joinHousehold(input: {
  inviteCode: string;
  displayName: string;
  locale: Locale;
  bootstrap?: string | null;
}) {
  if (!hasDatabaseUrl() && input.bootstrap) {
    try {
      await importHouseholdBootstrap(input.bootstrap);
    } catch {
      // continue; may already exist via invite code in local store
    }
  }

  const code = input.inviteCode.trim().toUpperCase();
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM households WHERE invite_code = ${code} LIMIT 1`;
    if (rows.length === 0) throw new Error("INVITE_NOT_FOUND");
    const household = mapHousehold(rows[0] as Record<string, unknown>);
    const countRows = await sql`
      SELECT COUNT(*)::int AS count FROM members WHERE household_id = ${household.id}
    `;
    const count = Number((countRows[0] as { count: number }).count) || 0;
    if (count >= MAX_HOUSEHOLD_MEMBERS) throw new Error("HOUSEHOLD_FULL");
    const member: Member = {
      id: nanoid(),
      householdId: household.id,
      displayName: input.displayName.trim(),
      role: "member",
      locale: input.locale,
      createdAt: now,
    };
    await sql`
      INSERT INTO members (id, household_id, display_name, role, locale, created_at)
      VALUES (${member.id}, ${member.householdId}, ${member.displayName}, ${member.role}, ${member.locale}, ${member.createdAt})
    `;
    return { household, member };
  }

  const db = await readLocalDb();
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
    createdAt: now,
  };
  db.members.push(member);
  await writeLocalDb(db);
  return { household, member };
}

export async function getHouseholdBundle(householdId: string) {
  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const households = await sql`SELECT * FROM households WHERE id = ${householdId} LIMIT 1`;
    if (households.length === 0) return null;
    const household = mapHousehold(households[0] as Record<string, unknown>);
    const memberRows = await sql`SELECT * FROM members WHERE household_id = ${householdId}`;
    const needRows = await sql`
      SELECT * FROM needs WHERE household_id = ${householdId} ORDER BY created_at DESC
    `;
    const presenceRows = await sql`SELECT * FROM presence WHERE household_id = ${householdId}`;
    return {
      household,
      members: memberRows.map((r) => mapMember(r as Record<string, unknown>)),
      needs: needRows.map((r) => mapNeed(r as Record<string, unknown>)),
      presence: presenceRows.map((r) => mapPresence(r as Record<string, unknown>)),
      bootstrap: "",
    };
  }

  const db = await readLocalDb();
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
  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM members WHERE id = ${memberId} LIMIT 1`;
    if (rows.length === 0) return null;
    return mapMember(rows[0] as Record<string, unknown>);
  }
  const db = await readLocalDb();
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

  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO needs (
        id, household_id, name, quantity, category, status, claimed_by_id, urgent,
        recurring_cadence, notes, created_by_id, bought_at, bought_by_id, amount, created_at
      ) VALUES (
        ${need.id}, ${need.householdId}, ${need.name}, ${need.quantity}, ${need.category},
        ${need.status}, ${need.claimedById}, ${need.urgent}, ${need.recurringCadence},
        ${need.notes}, ${need.createdById}, ${need.boughtAt}, ${need.boughtById},
        ${need.amount}, ${need.createdAt}
      )
    `;
    return need;
  }

  const db = await readLocalDb();
  db.needs.push(need);
  await writeLocalDb(db);
  return need;
}

export async function claimNeed(needId: string, memberId: string) {
  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM needs WHERE id = ${needId} LIMIT 1`;
    if (rows.length === 0 || String(rows[0].status) === "bought") {
      throw new Error("NEED_NOT_CLAIMABLE");
    }
    await sql`
      UPDATE needs SET status = 'claimed', claimed_by_id = ${memberId} WHERE id = ${needId}
    `;
    const updated = await sql`SELECT * FROM needs WHERE id = ${needId} LIMIT 1`;
    return mapNeed(updated[0] as Record<string, unknown>);
  }

  const db = await readLocalDb();
  const need = db.needs.find((n) => n.id === needId);
  if (!need || need.status === "bought") throw new Error("NEED_NOT_CLAIMABLE");
  need.status = "claimed";
  need.claimedById = memberId;
  await writeLocalDb(db);
  return need;
}

export async function reassignNeed(needId: string, memberId: string | null) {
  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM needs WHERE id = ${needId} LIMIT 1`;
    if (rows.length === 0 || String(rows[0].status) === "bought") {
      throw new Error("NEED_NOT_REASSIGNABLE");
    }
    if (!memberId) {
      await sql`
        UPDATE needs SET status = 'open', claimed_by_id = NULL WHERE id = ${needId}
      `;
    } else {
      await sql`
        UPDATE needs SET status = 'claimed', claimed_by_id = ${memberId} WHERE id = ${needId}
      `;
    }
    const updated = await sql`SELECT * FROM needs WHERE id = ${needId} LIMIT 1`;
    return mapNeed(updated[0] as Record<string, unknown>);
  }

  const db = await readLocalDb();
  const need = db.needs.find((n) => n.id === needId);
  if (!need || need.status === "bought") throw new Error("NEED_NOT_REASSIGNABLE");
  if (!memberId) {
    need.status = "open";
    need.claimedById = null;
  } else {
    need.status = "claimed";
    need.claimedById = memberId;
  }
  await writeLocalDb(db);
  return need;
}

export async function markBought(input: {
  needId: string;
  boughtById: string;
  amount: number | null;
}) {
  const now = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM needs WHERE id = ${input.needId} LIMIT 1`;
    if (rows.length === 0 || String(rows[0].status) === "bought") {
      throw new Error("NEED_NOT_BUYABLE");
    }
    const need = mapNeed(rows[0] as Record<string, unknown>);
    await sql`
      UPDATE needs
      SET status = 'bought',
          bought_at = ${now},
          bought_by_id = ${input.boughtById},
          amount = ${input.amount},
          claimed_by_id = NULL
      WHERE id = ${input.needId}
    `;
    if (need.recurringCadence) {
      const nextId = nanoid();
      await sql`
        INSERT INTO needs (
          id, household_id, name, quantity, category, status, claimed_by_id, urgent,
          recurring_cadence, notes, created_by_id, bought_at, bought_by_id, amount, created_at
        ) VALUES (
          ${nextId}, ${need.householdId}, ${need.name}, ${need.quantity}, ${need.category},
          'open', NULL, FALSE, ${need.recurringCadence}, ${need.notes}, ${need.createdById},
          NULL, NULL, NULL, ${now}
        )
      `;
    }
    const updated = await sql`SELECT * FROM needs WHERE id = ${input.needId} LIMIT 1`;
    return mapNeed(updated[0] as Record<string, unknown>);
  }

  const db = await readLocalDb();
  const need = db.needs.find((n) => n.id === input.needId);
  if (!need || need.status === "bought") throw new Error("NEED_NOT_BUYABLE");
  need.status = "bought";
  need.boughtAt = now;
  need.boughtById = input.boughtById;
  need.amount = input.amount;
  need.claimedById = null;

  if (need.recurringCadence) {
    db.needs.push({
      ...need,
      id: nanoid(),
      status: "open",
      claimedById: null,
      urgent: false,
      boughtAt: null,
      boughtById: null,
      amount: null,
      createdAt: now,
    });
  }

  await writeLocalDb(db);
  return need;
}

export async function setPresence(input: {
  memberId: string;
  householdId: string;
  status: PresenceStatus;
  placeText: string | null;
  backBy: string | null;
}) {
  const updatedAt = new Date().toISOString();
  const row: Presence = {
    memberId: input.memberId,
    householdId: input.householdId,
    status: input.status,
    placeText: input.placeText,
    backBy: input.backBy,
    updatedAt,
  };

  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO presence (member_id, household_id, status, place_text, back_by, updated_at)
      VALUES (${row.memberId}, ${row.householdId}, ${row.status}, ${row.placeText}, ${row.backBy}, ${row.updatedAt})
      ON CONFLICT (member_id) DO UPDATE SET
        household_id = EXCLUDED.household_id,
        status = EXCLUDED.status,
        place_text = EXCLUDED.place_text,
        back_by = EXCLUDED.back_by,
        updated_at = EXCLUDED.updated_at
    `;
    return row;
  }

  const db = await readLocalDb();
  const existing = db.presence.find((p) => p.memberId === input.memberId);
  if (existing) Object.assign(existing, row);
  else db.presence.push(row);
  await writeLocalDb(db);
  return row;
}

export async function clearPresence(memberId: string) {
  const updatedAt = new Date().toISOString();

  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM presence WHERE member_id = ${memberId} LIMIT 1`;
    if (rows.length === 0) return null;
    await sql`
      UPDATE presence
      SET status = 'home', place_text = NULL, back_by = NULL, updated_at = ${updatedAt}
      WHERE member_id = ${memberId}
    `;
    const updated = await sql`SELECT * FROM presence WHERE member_id = ${memberId} LIMIT 1`;
    return mapPresence(updated[0] as Record<string, unknown>);
  }

  const db = await readLocalDb();
  const existing = db.presence.find((p) => p.memberId === memberId);
  if (!existing) return null;
  existing.status = "home";
  existing.placeText = null;
  existing.backBy = null;
  existing.updatedAt = updatedAt;
  await writeLocalDb(db);
  return existing;
}

export async function setMemberLocale(memberId: string, locale: Locale) {
  if (hasDatabaseUrl()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM members WHERE id = ${memberId} LIMIT 1`;
    if (rows.length === 0) return null;
    await sql`UPDATE members SET locale = ${locale} WHERE id = ${memberId}`;
    const updated = await sql`SELECT * FROM members WHERE id = ${memberId} LIMIT 1`;
    return mapMember(updated[0] as Record<string, unknown>);
  }

  const db = await readLocalDb();
  const member = db.members.find((m) => m.id === memberId);
  if (!member) return null;
  member.locale = locale;
  await writeLocalDb(db);
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
