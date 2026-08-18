import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { setLocaleAction } from "@/lib/actions";

export default async function WelcomePage() {
  const session = await getSession();
  if (session) redirect("/today");

  const jar = await cookies();
  const locale = (jar.get("hc_locale")?.value as Locale) || "en";
  const d = t(locale);

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-14">
      <div className="mb-5 flex gap-2">
        <form action={setLocaleAction}>
          <input type="hidden" name="locale" value="en" />
          <button
            type="submit"
            className={`rounded-full border px-3 py-1.5 text-xs ${
              locale === "en"
                ? "border-accent bg-accent-soft font-bold text-accent"
                : "border-line bg-white font-medium text-ink"
            }`}
          >
            English
          </button>
        </form>
        <form action={setLocaleAction}>
          <input type="hidden" name="locale" value="zh-Hant" />
          <button
            type="submit"
            className={`rounded-full border px-3 py-1.5 text-xs ${
              locale === "zh-Hant"
                ? "border-accent bg-accent-soft font-bold text-accent"
                : "border-line bg-white font-medium text-ink"
            }`}
          >
            繁體中文
          </button>
        </form>
      </div>

      <h1 className="font-[family-name:var(--font-bricolage)] text-[2.1rem] font-bold leading-tight tracking-tight text-ink">
        {d.brand}
      </h1>
      <p className="mt-3 max-w-[36ch] text-[0.95rem] leading-relaxed text-muted">{d.tagline}</p>

      <div className="mt-10 grid gap-3">
        <Link
          href="/create"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white"
        >
          {d.getStarted}
        </Link>
        <Link
          href="/join"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink"
        >
          {d.joinHousehold}
        </Link>
      </div>
    </main>
  );
}
