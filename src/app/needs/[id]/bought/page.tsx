import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { markBoughtAction } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { getHouseholdBundle, getMember } from "@/lib/store";
import { t } from "@/lib/i18n";

export default async function BoughtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  if (!member) redirect("/");
  const bundle = await getHouseholdBundle(session.householdId);
  if (!bundle) redirect("/");
  const { id } = await params;
  const need = bundle.needs.find((n) => n.id === id && n.status !== "bought");
  if (!need) notFound();
  const d = t(member.locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.5rem] font-bold tracking-tight">
        {d.markBought}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{d.boughtHint}</p>
      <form action={markBoughtAction} className="mt-6 grid gap-4">
        <input type="hidden" name="needId" value={need.id} />
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.item}
          <input
            disabled
            value={`${need.name}${need.quantity > 1 ? ` ×${need.quantity}` : ""}`}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium opacity-80"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.whoBought}
          <select
            name="boughtById"
            defaultValue={need.claimedById || session.memberId}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          >
            {bundle.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.amountOptional}
          <input
            name="amount"
            inputMode="decimal"
            placeholder="28.50"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-muted">
          {d.currency}
          <input
            disabled
            value="HKD"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium opacity-80"
          />
        </label>
        <button
          type="submit"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-apricot text-sm font-bold text-[#3a2a20]"
        >
          {d.saveArchive}
        </button>
        <Link href="/needs" className="text-center text-sm font-bold text-accent">
          {d.cancel}
        </Link>
      </form>
    </main>
  );
}
