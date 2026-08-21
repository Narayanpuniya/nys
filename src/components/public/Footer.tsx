import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon, WhatsappIcon } from "@/components/ui/BrandIcons";
import { LogoMark } from "@/components/ui/Logo";
import { getSettings } from "@/lib/settings";
import { getI18n } from "@/lib/i18n";

export async function Footer() {
  const [s, { dict }] = await Promise.all([getSettings(), getI18n()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16" style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}>

      {/* Top divider */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f59e0b, #d97706, #b45309, #d97706, #f59e0b)" }} />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Col 1: Logo + About ── */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 ring-1 ring-amber-500/30">
                <LogoMark className="h-7 w-7" imageUrl={s.logoUrl} />
              </div>
              <div>
                <p className="text-sm font-extrabold leading-tight text-white">{s.shortName}</p>
                <p className="text-[10px] tracking-widest text-amber-400/70 uppercase">www.nys.org.in</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{s.tagline}</p>
            {s.legal?.registrationNo && (
              <div className="mt-3 inline-block rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
                <p className="text-[9px] uppercase tracking-widest text-amber-400/70">पंजीकरण संख्या</p>
                <p className="text-xs font-semibold text-amber-300">{s.legal.registrationNo}</p>
              </div>
            )}
            {/* Social icons */}
            <div className="mt-4 flex gap-2">
              {s.social.facebook  && <a href={s.social.facebook}  target="_blank" rel="noreferrer" aria-label="Facebook"  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"><FacebookIcon  className="h-4 w-4" /></a>}
              {s.social.instagram && <a href={s.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"><InstagramIcon className="h-4 w-4" /></a>}
              {s.social.youtube   && <a href={s.social.youtube}   target="_blank" rel="noreferrer" aria-label="YouTube"   className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"><YoutubeIcon   className="h-4 w-4" /></a>}
              {s.social.whatsapp  && <a href={s.social.whatsapp}  target="_blank" rel="noreferrer" aria-label="WhatsApp"  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"><WhatsappIcon  className="h-4 w-4" /></a>}
            </div>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-400">{dict.footer_quick}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/activities"    className="text-slate-300 hover:text-amber-300 transition-colors">{dict.nav_activities}</Link></li>
              <li><Link href="/events"         className="text-slate-300 hover:text-amber-300 transition-colors">{dict.nav_events}</Link></li>
              <li><Link href="/campaigns"      className="text-slate-300 hover:text-amber-300 transition-colors">{dict.nav_campaigns}</Link></li>
              <li><Link href="/transparency"   className="text-slate-300 hover:text-amber-300 transition-colors">{dict.nav_transparency}</Link></li>
            </ul>
          </div>

          {/* ── Col 3: Join ── */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-400">{dict.footer_join}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/join"           className="text-slate-300 hover:text-amber-300 transition-colors">{dict.nav_join}</Link></li>
              <li><Link href="/donate"         className="text-slate-300 hover:text-amber-300 transition-colors">{dict.nav_donate}</Link></li>
              <li><Link href="/contact"        className="text-slate-300 hover:text-amber-300 transition-colors">{dict.nav_contact}</Link></li>
              <li><Link href="/verify"         className="text-slate-300 hover:text-amber-300 transition-colors">{dict.footer_verify}</Link></li>
              <li><Link href="/login"          className="text-slate-300 hover:text-amber-300 transition-colors">{dict.footer_member_login}</Link></li>
            </ul>
          </div>

          {/* ── Col 4: Contact ── */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-400">{dict.footer_contact}</h4>
            <ul className="space-y-3 text-sm">
              {/* Address */}
              <li className="flex items-start gap-2 text-slate-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{s.address}</span>
              </li>

              {/* Phone numbers — Admin द्वारा set (phones[]) */}
              {s.phones && s.phones.length > 0 ? (
                s.phones.map((ph, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-amber-400" />
                    <a href={`tel:${ph.number}`} className="text-slate-300 hover:text-amber-300 transition-colors">
                      {ph.name ? <><span className="font-medium text-slate-200">{ph.name}</span> — {ph.number}</> : ph.number}
                    </a>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 shrink-0 text-amber-400" />
                  <a href={`tel:${s.mobile}`} className="hover:text-amber-300 transition-colors">{s.mobile}</a>
                </li>
              )}

              {/* Email */}
              {s.email && (
                <li className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                  <a href={`mailto:${s.email}`} className="hover:text-amber-300 transition-colors">{s.email}</a>
                </li>
              )}

              {/* WhatsApp link */}
              {s.social.whatsapp && (
                <li>
                  <a href={s.social.whatsapp} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-300 hover:bg-green-500/30 transition-colors">
                    <WhatsappIcon className="h-3.5 w-3.5" /> व्हाट्सएप पर संपर्क करें
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs text-slate-500">
              © {year} {s.name}. सर्वाधिकार सुरक्षित।
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-amber-400 transition-colors">{dict.footer_privacy}</Link>
              <Link href="/terms"   className="hover:text-amber-400 transition-colors">{dict.footer_terms}</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
