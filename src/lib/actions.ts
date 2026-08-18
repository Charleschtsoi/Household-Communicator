"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  addNeed,
  claimNeed,
  clearPresence,
  createHousehold,
  joinHousehold,
  markBought,
  reassignNeed,
  setMemberLocale,
  setPresence,
} from "./store";
import { clearSession, getSession, setSession } from "./session";
import type { Category, Locale, PresenceStatus, RecurringCadence } from "./types";

const localeSchema = z.enum(["en", "zh-Hant"]);

export async function createHouseholdAction(formData: FormData) {
  const householdName = String(formData.get("householdName") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();
  const locale = localeSchema.parse(String(formData.get("locale") || "en"));
  if (!householdName || !displayName) throw new Error("MISSING_FIELDS");
  const { household, member } = await createHousehold({
    householdName,
    displayName,
    locale,
  });
  await setSession({ householdId: household.id, memberId: member.id });
  redirect("/invite");
}

export async function joinHouseholdAction(formData: FormData) {
  const inviteCode = String(formData.get("inviteCode") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();
  const locale = localeSchema.parse(String(formData.get("locale") || "en"));
  const bootstrap = String(formData.get("bootstrap") || "").trim() || null;
  if (!inviteCode || !displayName) throw new Error("MISSING_FIELDS");
  try {
    const { household, member } = await joinHousehold({
      inviteCode,
      displayName,
      locale,
      bootstrap,
    });
    await setSession({ householdId: household.id, memberId: member.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "JOIN_FAILED";
    redirect(`/join?error=${encodeURIComponent(msg)}`);
  }
  redirect("/today");
}

export async function addNeedAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");
  const name = String(formData.get("name") || "").trim();
  const quantity = Number(formData.get("quantity") || 1);
  const category = String(formData.get("category") || "groceries") as Category;
  const urgent = formData.get("urgent") === "on";
  const recurring = formData.get("recurring") === "on";
  const cadence = String(formData.get("cadence") || "weekly") as RecurringCadence;
  if (!name) throw new Error("MISSING_NAME");
  await addNeed({
    householdId: session.householdId,
    createdById: session.memberId,
    name,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    category,
    urgent,
    recurringCadence: recurring ? cadence : null,
  });
  revalidatePath("/today");
  revalidatePath("/needs");
  redirect("/today");
}

export async function claimNeedAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");
  const needId = String(formData.get("needId") || "");
  await claimNeed(needId, session.memberId);
  revalidatePath("/today");
  revalidatePath("/needs");
}

export async function reassignNeedAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");
  const needId = String(formData.get("needId") || "");
  const memberIdRaw = String(formData.get("memberId") || "");
  await reassignNeed(needId, memberIdRaw === "" ? null : memberIdRaw);
  revalidatePath("/today");
  revalidatePath("/needs");
}

export async function markBoughtAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");
  const needId = String(formData.get("needId") || "");
  const boughtById = String(formData.get("boughtById") || session.memberId);
  const amountRaw = String(formData.get("amount") || "").trim();
  const amount = amountRaw === "" ? null : Number(amountRaw);
  await markBought({
    needId,
    boughtById,
    amount: amount != null && Number.isFinite(amount) ? amount : null,
  });
  revalidatePath("/today");
  revalidatePath("/needs");
  revalidatePath("/household");
  redirect("/needs");
}

export async function setPresenceAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");
  const status = String(formData.get("status") || "home") as PresenceStatus;
  const placeText = String(formData.get("placeText") || "").trim() || null;
  const backBy = String(formData.get("backBy") || "").trim() || null;
  await setPresence({
    memberId: session.memberId,
    householdId: session.householdId,
    status,
    placeText,
    backBy,
  });
  revalidatePath("/today");
  redirect("/today");
}

export async function clearPresenceAction() {
  const session = await getSession();
  if (!session) redirect("/");
  await clearPresence(session.memberId);
  revalidatePath("/today");
  redirect("/today");
}

function safeNextPath(raw: string) {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "";
  return raw;
}

export async function setLocaleAction(formData: FormData) {
  const session = await getSession();
  const locale = localeSchema.parse(String(formData.get("locale") || "en")) as Locale;
  const next = safeNextPath(String(formData.get("next") || "").trim());
  if (session) {
    await setMemberLocale(session.memberId, locale);
  }
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  jar.set("hc_locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
  for (const path of [
    "/",
    "/create",
    "/join",
    "/invite",
    "/today",
    "/needs",
    "/needs/new",
    "/presence",
    "/household",
  ]) {
    revalidatePath(path);
  }
  redirect(next || (session ? "/household" : "/"));
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
}
