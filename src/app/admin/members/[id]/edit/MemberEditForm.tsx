"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Field, inputClass, Card } from "@/components/ui/primitives";
import { updateMember, type UpdateMemberState } from "../../actions";
import { ImageCropper } from "@/components/ui/ImageCropper";

type Plan = { id: string; name: string };
type MemberEdit = {
  id: string;
  memberCode: string;
  fullName: string;
  guardianName: string | null;
  dob: Date | string | null;
  gender: string | null;
  mobile: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  village: string | null;
  tehsil: string | null;
  district: string | null;
  state: string | null;
  occupation: string | null;
  bloodGroup: string | null;
  emergencyContact: string | null;
  photoUrl: string | null;
  planId: string | null;
  status: string;
  showMobile: boolean;
};

function dobValue(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function MemberEditForm({ member, plans }: { member: MemberEdit; plans: Plan[] }) {
  const bound = updateMember.bind(null, member.id);
  const [state, action, pending] = useActionState<UpdateMemberState, FormData>(bound, {});

  // Photo crop state
  const [cropSrc, setCropSrc]     = useState<string | null>(null);
  const [preview, setPreview]     = useState<string>(member.photoUrl ?? "");
  const photoInputRef             = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(f);
    // Reset so same file can re-trigger
    e.target.value = "";
  }

  function handleCropDone(file: File, url: string) {
    setPreview(url);
    setCropSrc(null);
    // Set cropped file on the hidden input using DataTransfer
    if (photoInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      photoInputRef.current.files = dt.files;
    }
  }

  return (
    <>
      {/* Crop Modal */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onDone={handleCropDone}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <form action={action} encType="multipart/form-data" className="space-y-6">
        <Card className="p-6">
          <h3 className="mb-4 font-bold text-ink">फोटो</h3>
          <div className="flex flex-wrap items-center gap-4">
            {/* Preview */}
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-saffron-100 text-4xl">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={member.fullName} className="h-full w-full object-cover" />
              ) : "🙂"}
            </div>

            {/* Upload trigger */}
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-saffron-300 bg-saffron-50 px-4 py-2 text-sm font-medium text-saffron-800 hover:bg-saffron-100">
                📷 फोटो चुनें (क्रॉप होगी)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              {/* Hidden input that holds the cropped file for form submission */}
              <input
                ref={photoInputRef}
                name="photo"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <p className="mt-1.5 text-xs text-stone-400">
                JPG/PNG/WEBP · अधिकतम 2 MB · खाली छोड़ने पर पुरानी फोटो रहेगी
              </p>
              {preview && preview !== member.photoUrl && (
                <p className="mt-1 text-xs font-medium text-green-600">✅ नई क्रॉप की हुई फोटो तैयार है</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold text-ink">व्यक्तिगत विवरण</h3>
          <p className="mb-3 text-sm text-stone-500">सदस्य ID: <span className="font-medium text-ink">{member.memberCode}</span></p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="पूरा नाम" required>
              <input name="fullName" required defaultValue={member.fullName} className={inputClass} />
            </Field>
            <Field label="पिता/पति का नाम">
              <input name="guardianName" defaultValue={member.guardianName ?? ""} className={inputClass} />
            </Field>
            <Field label="जन्म तिथि">
              <input name="dob" type="date" defaultValue={dobValue(member.dob)} className={inputClass} />
            </Field>
            <Field label="लिंग">
              <select name="gender" defaultValue={member.gender ?? ""} className={inputClass}>
                <option value="">— चुनें —</option>
                <option value="पुरुष">पुरुष</option>
                <option value="महिला">महिला</option>
                <option value="अन्य">अन्य</option>
              </select>
            </Field>
            <Field label="मोबाइल" required>
              <input name="mobile" required defaultValue={member.mobile} className={inputClass} />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" defaultValue={member.whatsapp ?? ""} className={inputClass} />
            </Field>
            <Field label="ईमेल">
              <input name="email" type="email" defaultValue={member.email ?? ""} className={inputClass} />
            </Field>
            <Field label="व्यवसाय">
              <input name="occupation" defaultValue={member.occupation ?? ""} className={inputClass} />
            </Field>
            <Field label="ब्लड ग्रुप">
              <input name="bloodGroup" defaultValue={member.bloodGroup ?? ""} className={inputClass} />
            </Field>
            <Field label="आपातकालीन संपर्क">
              <input name="emergencyContact" defaultValue={member.emergencyContact ?? ""} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="पता">
                <input name="address" defaultValue={member.address ?? ""} className={inputClass} />
              </Field>
            </div>
            <Field label="गाँव/शहर">
              <input name="village" defaultValue={member.village ?? ""} className={inputClass} />
            </Field>
            <Field label="तहसील">
              <input name="tehsil" defaultValue={member.tehsil ?? ""} className={inputClass} placeholder="तहसील का नाम" />
            </Field>
            <Field label="जिला">
              <input name="district" defaultValue={member.district ?? ""} className={inputClass} />
            </Field>
            <Field label="राज्य">
              <input name="state" defaultValue={member.state ?? "Rajasthan"} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold text-ink">सदस्यता</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="योजना">
              <select name="planId" defaultValue={member.planId ?? ""} className={inputClass}>
                <option value="">— चुनें —</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="स्थिति">
              <select name="status" defaultValue={member.status} className={inputClass}>
                <option value="PENDING">लंबित (PENDING)</option>
                <option value="ACTIVE">सक्रिय (ACTIVE)</option>
                <option value="EXPIRED">समाप्त (EXPIRED)</option>
                <option value="REJECTED">अस्वीकृत (REJECTED)</option>
              </select>
            </Field>
            <label className="mt-2 flex items-center gap-2 text-sm text-stone-600 sm:col-span-2">
              <input type="checkbox" name="showMobile" defaultChecked={member.showMobile} />
              सार्वजनिक रूप से मोबाइल दिखाएँ
            </label>
          </div>
        </Card>

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-saffron-600 px-6 py-2.5 font-medium text-white hover:bg-saffron-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            सहेजें
          </button>
          <Link
            href={`/admin/members/${member.id}`}
            className="rounded-xl border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            रद्द करें
          </Link>
        </div>
      </form>
    </>
  );
}
