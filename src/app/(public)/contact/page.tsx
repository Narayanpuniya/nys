import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageSquarePlus } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { ContactForm } from "@/components/public/ContactForm";
import { SuggestionForm } from "@/components/public/SuggestionForm";
import { FacebookIcon, InstagramIcon, YoutubeIcon, WhatsappIcon } from "@/components/ui/BrandIcons";

export const metadata: Metadata = { title: "संपर्क करें" };
export const revalidate = 300;

function waUrl(val?: string): string | undefined {
  if (!val) return undefined;
  if (val.startsWith("http")) return val;
  const d = val.replace(/\D/g, "");
  if (d.length >= 10) return `https://wa.me/${d.startsWith("91") && d.length === 12 ? d : `91${d.slice(-10)}`}`;
  return undefined;
}

export default async function ContactPage() {
  const s = await getSettings();
  const whatsappLink = waUrl(s.social.whatsapp);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionHeading title="संपर्क करें" subtitle="किसी भी जानकारी या सहयोग हेतु हमसे संपर्क करें।" />

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Left column — org info + contact form */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 font-bold text-ink">{s.name}</h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron-600" /> {s.address}</li>

              {/* ── एकाधिक संपर्क नंबर ── */}
              {s.phones && s.phones.length > 0 ? (
                s.phones.map((ph, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-saffron-600" />
                    <div>
                      {ph.name && <span className="font-medium text-ink">{ph.name}: </span>}
                      <a href={`tel:${ph.number}`} className="hover:text-saffron-700 hover:underline">{ph.number}</a>
                    </div>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-saffron-600" />
                  <a href={`tel:${s.mobile}`} className="hover:underline">{s.mobile}</a>
                </li>
              )}

              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-saffron-600" /> <a href={`mailto:${s.email}`} className="hover:underline">{s.email}</a></li>
            </ul>
            <div className="mt-4 flex gap-2">
              {s.social.facebook  && <a href={s.social.facebook}  target="_blank" rel="noreferrer" className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100"><FacebookIcon  className="h-4 w-4" /></a>}
              {s.social.instagram && <a href={s.social.instagram} target="_blank" rel="noreferrer" className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100"><InstagramIcon className="h-4 w-4" /></a>}
              {s.social.youtube   && <a href={s.social.youtube}   target="_blank" rel="noreferrer" className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100"><YoutubeIcon   className="h-4 w-4" /></a>}
              {whatsappLink       && <a href={whatsappLink}       target="_blank" rel="noreferrer" className="rounded-lg bg-saffron-50 p-2 text-saffron-700 hover:bg-saffron-100"><WhatsappIcon  className="h-4 w-4" /></a>}
            </div>
          </Card>

          {/* General contact form */}
          <Card className="p-6">
            <h3 className="mb-4 font-bold text-ink">📨 संदेश भेजें</h3>
            <ContactForm />
          </Card>
        </div>

        {/* Right column — suggestion / problem form */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-saffron-600" />
            <h3 className="font-bold text-ink">सुझाव / समस्या / शिकायत</h3>
          </div>
          <p className="mb-4 text-sm text-stone-500">
            कोई सुझाव हो, समस्या हो, या शिकायत — यहाँ भेजें। हम हर संदेश पढ़ते हैं।
          </p>
          <SuggestionForm />
        </Card>

      </div>
    </div>
  );
}
