import type { Metadata } from "next";
import { Hind } from "next/font/google";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import "./globals.css";

const hind = Hind({
  variable: "--font-hind",
  subsets: ["latin", "devanagari"],
  weight: ["400", "600", "700"], // 300 और 500 remove — 2 कम font requests
  display: "swap",
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "नारायणपुरी यूथ सोसाइटी, गुदियाल नगर (NYS)",
    template: "%s | NYS",
  },
  description:
    "नारायणपुरी यूथ सोसाइटी (NYS), गुदियाल नगर — शिक्षा, खेल, पर्यावरण और विरासत के माध्यम से समाज एवं युवाओं के विकास हेतु समर्पित संस्था।",
  keywords: ["NYS", "नारायणपुरी यूथ सोसाइटी", "गुदियाल नगर", "NGO", "युवा विकास"],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    siteName: "NYS",
    title: "नारायणपुरी यूथ सोसाइटी, गुदियाल नगर",
    description:
      "शिक्षा, खेल, पर्यावरण और विरासत के माध्यम से समाज एवं युवाओं के विकास की ओर एक कदम।",
    images: [{ url: "/nys-logo.png", width: 512, height: 512, alt: "NYS Logo" }],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <html lang={locale} className={`${hind.variable} h-full antialiased`}>
      <head>
        {/* DNS preconnect — Neon DB hostname और Google Fonts पर fast connection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
