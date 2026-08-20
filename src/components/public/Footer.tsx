import Link from "next/link";
import { FacebookIcon, InstagramIcon, YoutubeIcon, WhatsappIcon } from "@/components/ui/BrandIcons";
import { LogoFull } from "@/components/ui/Logo";
import { getSettings } from "@/lib/settings";
import { getI18n } from "@/lib/i18n";

export async function Footer() {
  const [s, { dict }] = await Promise.all([getSettings(), getI18n()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-saffron-100 bg-white/70">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Top section: Logo block — full width on mobile, 1/3 on desktop */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8 lg:gap-12">
          {/* Logo + About */}
          <div className="shrink-0 lg:max-w-xs">
            <LogoFull imageUrl={s.logoUrl} name={dict.orgName} place={dict.orgPlace} />
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{s.tagline}</p>
            <p className="mt-1 text-sm text-stone-500">{s.address}</p>
            {s.legal.registrationNo && (
              <div className="mt-2 inline-block rounded-lg border border-saffron-100 bg-saffron-50 px-3 py-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">पंजीकरण संख्या</p>
                <p className="text-xs font-semibold text-saffron-800">{s.legal.registrationNo}</p>
                {s.legal.pan && <p className="text-[10px] text-stone-500">PAN: {s.legal.pan}</p>}
              </div>
            )}
          </div>

          {/* Links — 2-col grid on mobile, 3-col on sm+ */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 sm:flex-1">
            {/* त्वरित लिंक */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink">{dict.footer_quick}</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><Link href="/activities" className="hover:text-saffron-700">{dict.nav_activities}</Link></li>
                <li><Link href="/events" className="hover:text-saffron-700">{dict.nav_events}</Link></li>
                <li><Link href="/campaigns" className="hover:text-saffron-700">{dict.nav_campaigns}</Link></li>
                <li><Link href="/transparency" className="hover:text-saffron-700">{dict.nav_transparency}</Link></li>
              </ul>
            </div>

            {/* जुड़ें */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink">{dict.footer_join}</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><Link href="/join" className="hover:text-saffron-700">{dict.nav_join}</Link></li>
                <li><Link href="/donate" className="hover:text-saffron-700">{dict.nav_donate}</Link></li>
                <li><Link href="/contact" className="hover:text-saffron-700">{dict.nav_contact}</Link></li>
                <li><Link href="/verify" className="hover:text-saffron-700">{dict.footer_verify}</Link></li>
                <li><Link href="/login" className="hover:text-saffron-700">{dict.footer_member_login}</Link></li>
              </ul>
            </div>

            {/* संपर्क — spans full row on mobile 2-col (col-span-2), normal on sm+ */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-2 text-sm font-semibold text-ink">{dict.footer_contact}</h4>
              <p className="text-sm text-stone-600">{s.mobile}</p>
              <p className="text-sm text-stone-600">{s.email}</p>
              <div className="mt-3 flex gap-2">
                {s.social.facebook && (
                  <a href={s.social.facebook} className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100" aria-label="Facebook"><FacebookIcon className="h-4 w-4" /></a>
                )}
                {s.social.instagram && (
                  <a href={s.social.instagram} className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100" aria-label="Instagram"><InstagramIcon className="h-4 w-4" /></a>
                )}
                {s.social.youtube && (
                  <a href={s.social.youtube} className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100" aria-label="YouTube"><YoutubeIcon className="h-4 w-4" /></a>
                )}
                {s.social.whatsapp && (
                  <a href={s.social.whatsapp} className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100" aria-label="WhatsApp"><WhatsappIcon className="h-4 w-4" /></a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-saffron-100 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500">
            <span>© {year} {dict.orgName}. {dict.footer_rights}.</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-saffron-700">{dict.footer_privacy}</Link>
              <Link href="/terms" className="hover:text-saffron-700">{dict.footer_terms}</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
