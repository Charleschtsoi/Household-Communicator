import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdBundle, getMember } from "@/lib/store";
import { t } from "@/lib/i18n";
import { CopyInvite } from "@/components/copy-invite";
import { SessionRecovery } from "@/components/session-recovery";

export default async function InvitePage() {
  const session = await getSession();
  if (!session) redirect("/");
  const member = await getMember(session.memberId);
  const bundle = member ? await getHouseholdBundle(session.householdId) : null;
  if (!member || !bundle) {
    return <SessionRecovery />;
  }
  const d = t(member.locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        {d.inviteHousehold}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{d.inviteHint}</p>
      <div className="mt-5 rounded-2xl border border-[#c9ddd8] bg-gradient-to-br from-[#eef6f4] to-[#f7efe8] p-4">
        <div className="text-xs font-medium text-muted">{d.inviteCode}</div>
        <div className="mt-1 font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-[0.2em]">
          {bundle.household.inviteCode}
        </div>
        <CopyInvite
          code={bundle.household.inviteCode}
          bootstrap={bundle.bootstrap}
          label={d.copyLink}
          copiedLabel={d.copied}
        />
      </div>
      <div className="mt-6 grid gap-3">
        <Link
          href="/needs/new"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.addWhatWeNeed}
        </Link>
        <Link href="/today" className="text-center text-sm font-bold text-accent">
          {d.skipForNow}
        </Link>
      </div>
    </main>
  );
}
