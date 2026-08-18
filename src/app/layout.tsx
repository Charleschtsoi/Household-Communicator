import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { htmlLang, parseLocale, t } from "@/lib/i18n";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies();
  const locale = parseLocale(jar.get("hc_locale")?.value);
  const d = t(locale);
  return {
    title: d.brand,
    description: d.metaDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const locale = parseLocale(jar.get("hc_locale")?.value);

  return (
    <html lang={htmlLang(locale)}>
      <body className={`${figtree.variable} ${bricolage.variable} font-sans antialiased`}>
        <div className="phone-shell">{children}</div>
      </body>
    </html>
  );
}
