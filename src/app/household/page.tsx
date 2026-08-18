import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { CopyInvite } from "@/components/copy-invite";
import { setLocaleAction, signOutAction } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { getHouseholdBundle, getMember, monthSpendTotals } from "@/lib/store";
import { t } from "@/lib/i18n";
import { MAX_HOUSEHOLD_MEMBERS } from "@/lib/types";

export default async function HouseholdPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  if (!member) redirect("/");
  const bundle = await getHouseholdBundle(session.householdId);
  if (!bundle) redirect("/");
  const d = t(member.locale);
  const { totals, householdTotal } = monthSpendTotals(bundle.needs, bundle.members);
  const full = bundle.members.length >= MAX_HOUSEHOLD_MEMBERS;

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-12">
      <h1 className="mb-4 font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        {d.household}
      </h1>

      <section className="mb-5">
        <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
          {d.thisMonth}
        </h2>
        <div className="mb-2 grid grid-cols-2 gap-2">
          {bundle.members.map((m) => (
            <div key={m.id} className="rounded-xl border border-line bg-white p-3">
              <div className="text-xs text-muted">{m.displayName}</div>
              <div className="font-[family-name:var(--font-bricolage)] text-xl font-bold">
                ${Math.round(totals[m.id] || 0)}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-line bg-white p-3">
          <div className="font-semibold">
            {d.householdTotal} · ${Math.round(householdTotal)} HKD
          </div>
          <div className="mt-1 text-xs text-muted">{d.optionalAmounts}</div>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
          {bundle.household.name}
        </h2>
        <div className="grid gap-2">
          {bundle.members.map((m) => (
            <div key={m.id} className="rounded-2xl border border-line bg-white p-3">
              <div className="font-semibold">{m.displayName}</div>
              <div className="text-xs text-muted">{m.role === "owner" ? d.owner : d.member}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
          {d.inviteAgain}
        </h2>
        {full ? (
          <p className="text-sm font-semibold text-urgent">{d.householdFull}</p>
        ) : (
          <div className="rounded-2xl border border-[#c9ddd8] bg-gradient-to-br from-[#eef6f4] to-[#f7efe8] p-4">
            <div className="text-xs font-medium text-muted">{d.inviteCode}</div>
            <div className="mt-1 font-[family-name:var(--font-bricolage)] text-[1.5rem] font-bold tracking-[0.2em]">
              {bundle.household.inviteCode}
            </div>
            <CopyInvite
              code={bundle.household.inviteCode}
              label={d.copyLink}
              copiedLabel={d.copied}
            />
          </div>
        )}
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">
          {d.settings}
        </h2>
        <div className="grid gap-2">
          <div className="rounded-2xl border border-line bg-white p-3">
            <div className="font-semibold">{d.language}</div>
            <div className="mt-2 flex gap-2">
              <form action={setLocaleAction}>
                <input type="hidden" name="locale" value="en" />
                <input type="hidden" name="next" value="/household" />
                <button
                  type="submit"
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    member.locale === "en"
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-white"
                  }`}
                >
                  English
                </button>
              </form>
              <form action={setLocaleAction}>
                <input type="hidden" name="locale" value="zh-Hant" />
                <input type="hidden" name="next" value="/household" />
                <button
                  type="submit"
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    member.locale === "zh-Hant"
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-white"
                  }`}
                >
                  繁體中文
                </button>
              </form>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-3">
            <div className="font-semibold">{d.presencePrivacy}</div>
            <div className="mt-1 text-xs text-muted">{d.presencePrivacyHint}</div>
          </div>
        </div>
      </section>

      <form action={signOutAction} className="mb-4">
        <button type="submit" className="text-sm font-bold text-muted underline">
          Sign out
        </button>
      </form>

      <Link href="/invite" className="mb-2 text-center text-sm font-bold text-accent">
        {d.inviteAgain}
      </Link>

      <BottomNav active="household" locale={member.locale} />
    </main>
  );
}
