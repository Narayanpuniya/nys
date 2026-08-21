import { getSettings } from "@/lib/settings";
import { isMockMode } from "@/lib/payments";
import { Card, Field, inputClass, Badge } from "@/components/ui/primitives";
import { updateSettings } from "./actions";

export const dynamic = "force-dynamic";

function Preview({ src, label }: { src?: string; label: string }) {
  if (!src) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-xs text-stone-400">
        {label} — अभी नहीं
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={label} className="h-24 w-full rounded-xl border border-stone-200 object-contain bg-white p-1" />
  );
}

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">सेटिंग्स</h1>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium text-ink">भुगतान गेटवे:</span>
          {isMockMode()
            ? <Badge tone="amber">MOCK MODE (Razorpay keys सेट नहीं) — .env में keys डालें</Badge>
            : <Badge tone="green">Razorpay LIVE</Badge>}
        </div>
      </Card>

      <form action={updateSettings} encType="multipart/form-data" className="space-y-6">
        <Card className="p-6">
          <h3 className="mb-3 font-bold text-ink">संस्था विवरण</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="नाम"><input name="name" defaultValue={s.name} className={inputClass} /></Field>
            <Field label="संक्षिप्त नाम"><input name="shortName" defaultValue={s.shortName} className={inputClass} /></Field>
            <div className="sm:col-span-2"><Field label="Tagline"><input name="tagline" defaultValue={s.tagline} className={inputClass} /></Field></div>
            <div className="sm:col-span-2"><Field label="पता"><input name="address" defaultValue={s.address} className={inputClass} /></Field></div>
            <Field label="मोबाइल"><input name="mobile" defaultValue={s.mobile} className={inputClass} /></Field>
            <Field label="ईमेल"><input name="email" defaultValue={s.email} className={inputClass} /></Field>
          </div>
        </Card>

        {/* ── संपर्क नंबर (5 तक) ── */}
        <Card className="p-6">
          <h3 className="mb-1 font-bold text-ink">संपर्क नंबर (Contact Numbers)</h3>
          <p className="mb-4 text-sm text-stone-500">ये नंबर public website के संपर्क पेज पर दिखेंगे। 5 तक जोड़ सकते हैं।</p>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => {
              const ph = s.phones[i] ?? { name: "", number: "" };
              return (
                <div key={i} className="grid gap-3 sm:grid-cols-2 rounded-xl border border-stone-100 bg-stone-50/50 p-3">
                  <Field label={`फोन ${i + 1} — नाम`}>
                    <input name={`phoneName${i + 1}`} defaultValue={ph.name} placeholder="जैसे: अध्यक्ष / बुधाराम जी" className={inputClass} />
                  </Field>
                  <Field label={`फोन ${i + 1} — नंबर`}>
                    <input name={`phoneNumber${i + 1}`} defaultValue={ph.number} placeholder="9XXXXXXXXX" inputMode="tel" className={inputClass} />
                  </Field>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-3 font-bold text-ink">संस्था लोगो</h3>
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <Preview src={s.logoUrl} label="लोगो" />
            <Field label="नया लोगो अपलोड करें" hint="JPG/PNG/WEBP, अधिकतम 2 MB">
              <input name="logo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-1 font-bold text-ink">सील व हस्ताक्षर</h3>
          <p className="mb-4 text-sm text-stone-500">प्रमाणपत्र / रसीद पर उपयोग होगा। अध्यक्ष, सचिव और कोषाध्यक्ष।</p>
          <div className="space-y-6">
            {(
              [
                { title: "अध्यक्ष", seal: "presidentSeal", sign: "presidentSign", sealUrl: s.branding.presidentSealUrl, signUrl: s.branding.presidentSignUrl },
                { title: "सचिव", seal: "secretarySeal", sign: "secretarySign", sealUrl: s.branding.secretarySealUrl, signUrl: s.branding.secretarySignUrl },
                { title: "कोषाध्यक्ष", seal: "treasurerSeal", sign: "treasurerSign", sealUrl: s.branding.treasurerSealUrl, signUrl: s.branding.treasurerSignUrl },
              ] as const
            ).map((row) => (
              <div key={row.title} className="rounded-xl border border-stone-100 bg-stone-50/60 p-4">
                <h4 className="mb-3 font-semibold text-ink">{row.title}</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Preview src={row.sealUrl} label={`${row.title} सील`} />
                    <Field label="सील अपलोड" hint="वैकल्पिक — नई फ़ाइल चुनने पर बदल जाएगी">
                      <input name={row.seal} type="file" accept="image/*" className={inputClass} />
                    </Field>
                  </div>
                  <div>
                    <Preview src={row.signUrl} label={`${row.title} हस्ताक्षर`} />
                    <Field label="हस्ताक्षर अपलोड">
                      <input name={row.sign} type="file" accept="image/*" className={inputClass} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-3 font-bold text-ink">बैंक व UPI विवरण</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="खाताधारक का नाम"><input name="accountName" defaultValue={s.bank.accountName ?? ""} className={inputClass} /></Field>
            <Field label="बैंक का नाम"><input name="bankName" defaultValue={s.bank.bankName ?? ""} className={inputClass} /></Field>
            <Field label="खाता संख्या"><input name="accountNumber" defaultValue={s.bank.accountNumber ?? ""} className={inputClass} /></Field>
            <Field label="IFSC"><input name="ifsc" defaultValue={s.bank.ifsc ?? ""} className={inputClass} /></Field>
            <Field label="शाखा"><input name="branch" defaultValue={s.bank.branch ?? ""} className={inputClass} /></Field>
            <Field label="UPI ID"><input name="upiId" defaultValue={s.bank.upiId ?? ""} placeholder="nys@upi" className={inputClass} /></Field>
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-[160px_1fr]">
              <Preview src={s.bank.upiQrUrl} label="UPI QR" />
              <Field label="UPI QR कोड छवि" hint="वैकल्पिक">
                <input name="upiQr" type="file" accept="image/*" className={inputClass} />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-3 font-bold text-ink">सदस्यता व शुल्क</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="मासिक शुल्क (₹)"><input name="monthlyFee" type="number" defaultValue={s.monthlyFee} className={inputClass} /></Field>
            <Field label="वार्षिक शुल्क (₹)"><input name="annualFee" type="number" defaultValue={s.annualFee} className={inputClass} /></Field>
            <label className="mt-6 flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" name="membershipAutoApprove" defaultChecked={s.membershipAutoApprove} /> स्वतः स्वीकृति
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-3 font-bold text-ink">सोशल मीडिया</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Facebook"><input name="facebook" defaultValue={s.social.facebook ?? ""} className={inputClass} /></Field>
            <Field label="Instagram"><input name="instagram" defaultValue={s.social.instagram ?? ""} className={inputClass} /></Field>
            <Field label="YouTube"><input name="youtube" defaultValue={s.social.youtube ?? ""} className={inputClass} /></Field>
            <Field label="WhatsApp"><input name="whatsapp" defaultValue={s.social.whatsapp ?? ""} className={inputClass} /></Field>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-3 font-bold text-ink">कानूनी व गोपनीयता</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="पंजीकरण संख्या"><input name="registrationNo" defaultValue={s.legal.registrationNo ?? ""} className={inputClass} /></Field>
            <Field label="PAN"><input name="pan" defaultValue={s.legal.pan ?? ""} className={inputClass} /></Field>
          </div>
          <div className="mt-3 space-y-2 text-sm text-stone-600">
            <label className="flex items-center gap-2"><input type="checkbox" name="showLegalOnSite" defaultChecked={s.legal.showLegalOnSite} /> साइट पर कानूनी जानकारी दिखाएँ</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="donorInfoPublic" defaultChecked={s.privacy.donorInfoPublic} /> दानदाता जानकारी सार्वजनिक करें</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="showMemberMobileDefault" defaultChecked={s.privacy.showMemberMobileDefault} /> सदस्य मोबाइल डिफ़ॉल्ट रूप से दिखाएँ</label>
          </div>
        </Card>

        <button className="rounded-xl bg-saffron-600 px-6 py-2.5 font-medium text-white hover:bg-saffron-700">सेटिंग्स सहेजें</button>
      </form>
    </div>
  );
}
