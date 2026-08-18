import { signOutAction } from "@/lib/actions";

export function SessionRecovery() {
  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <h1 className="font-[family-name:var(--font-bricolage)] text-[1.75rem] font-bold tracking-tight">
        Session needs a reset
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Your browser still has a login cookie, but the household data for this Vercel demo wasn&apos;t
        available on this request. Start fresh to create or join again.
      </p>
      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          Start over
        </button>
      </form>
    </main>
  );
}
