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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <LogoFull imageUrl={s.logoUrl} name={dict.orgName} place={dict.orgPlace} />
          <p className="mt-3 max-w-xs text-sm text-stone-600">{s.tagline}</p>
          <p className="mt-3 text-sm text-stone-500">{s.address}</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">{dict.footer_quick}</h4>
          <ul className="space-y-2 text-sm text-stone-600">
            <li><Link href="/activities" className="hover:text-saffron-700">{dict.nav_activities}</Link></li>
            <li><Link href="/events" className="hover:text-saffron-700">{dict.nav_events}</Link></li>
            <li><Link href="/campaigns" className="hover:text-saffron-700">{dict.nav_campaigns}</Link></li>
            <li><Link href="/transparency" className="hover:text-saffron-700">{dict.nav_transparency}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">{dict.footer_join}</h4>
          <ul className="space-y-2 text-sm text-stone-600">
            <li><Link href="/join" className="hover:text-saffron-700">{dict.nav_join}</Link></li>
            <li><Link href="/donate" className="hover:text-saffron-700">{dict.nav_donate}</Link></li>
            <li><Link href="/contact" className="hover:text-saffron-700">{dict.nav_contact}</Link></li>
            <li><Link href="/verify" className="hover:text-saffron-700">{dict.footer_verify}</Link></li>
            <li><Link href="/login" className="hover:text-saffron-700">{dict.footer_member_login}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">{dict.footer_contact}</h4>
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

      <div className="border-t border-saffron-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-stone-500">
          <span>© {year} {dict.orgName}. {dict.footer_rights}.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-saffron-700">{dict.footer_privacy}</Link>
            <Link href="/terms" className="hover:text-saffron-700">{dict.footer_terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
