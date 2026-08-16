import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { ContactForm } from "@/components/public/ContactForm";
import { FacebookIcon, InstagramIcon, YoutubeIcon, WhatsappIcon } from "@/components/ui/BrandIcons";

export const metadata: Metadata = { title: "संपर्क करें" };
export const revalidate = 300;

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionHeading title="संपर्क करें" subtitle="किसी भी जानकारी या सहयोग हेतु हमसे संपर्क करें।" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 font-bold text-ink">{s.name}</h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-saffron-600" /> {s.address}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-saffron-600" /> <a href={`tel:${s.mobile}`}>{s.mobile}</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-saffron-600" /> <a href={`mailto:${s.email}`}>{s.email}</a></li>
            </ul>
            <div className="mt-4 flex gap-2">
              {s.social.facebook && <a href={s.social.facebook} className="rounded-lg bg-saffron-50 p-2 text-saffron-700"><FacebookIcon className="h-4 w-4" /></a>}
              {s.social.instagram && <a href={s.social.instagram} className="rounded-lg bg-saffron-50 p-2 text-saffron-700"><InstagramIcon className="h-4 w-4" /></a>}
              {s.social.youtube && <a href={s.social.youtube} className="rounded-lg bg-saffron-50 p-2 text-saffron-700"><YoutubeIcon className="h-4 w-4" /></a>}
              {s.social.whatsapp && <a href={s.social.whatsapp} className="rounded-lg bg-saffron-50 p-2 text-saffron-700"><WhatsappIcon className="h-4 w-4" /></a>}
            </div>
          </Card>
        </div>
        <Card className="p-6">
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
