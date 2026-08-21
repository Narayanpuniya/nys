import { saveEvent } from "@/app/admin/events/actions";
import { Field, inputClass } from "@/components/ui/primitives";
import { EVENT_STATUS } from "@/lib/constants";
import Image from "next/image";

type Event = {
  id: string; title: string; category: string; description: string; date: Date; time: string | null;
  venue: string | null; mapUrl: string | null; posterImage: string | null; registrationRequired: boolean;
  maxParticipants: number | null; contactPerson: string | null; contactNumber: string | null;
  status: string; featured: boolean;
};

export function EventForm({ event }: { event?: Event }) {
  const date = event?.date ? new Date(event.date).toISOString().slice(0, 10) : "";
  return (
    <form action={saveEvent} encType="multipart/form-data" className="space-y-4">
      {event && <input type="hidden" name="id" value={event.id} />}
      <Field label="शीर्षक" required><input name="title" defaultValue={event?.title} required className={inputClass} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="श्रेणी"><input name="category" defaultValue={event?.category ?? "GENERAL"} className={inputClass} /></Field>
        <Field label="दिनांक" required><input name="date" type="date" defaultValue={date} required className={inputClass} /></Field>
        <Field label="समय"><input name="time" defaultValue={event?.time ?? ""} className={inputClass} placeholder="प्रातः 9:00" /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="स्थान"><input name="venue" defaultValue={event?.venue ?? ""} className={inputClass} /></Field>
        <Field label="Google Map URL"><input name="mapUrl" defaultValue={event?.mapUrl ?? ""} className={inputClass} /></Field>
      </div>

      {/* पोस्टर upload */}
      <Field label="पोस्टर इमेज">
        <div className="space-y-2">
          {/* मौजूदा poster preview (edit mode) */}
          {event?.posterImage && (
            <div className="relative h-36 w-full overflow-hidden rounded-xl border border-stone-200">
              <Image src={event.posterImage} alt="poster" fill className="object-cover" unoptimized />
              <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">मौजूदा पोस्टर</span>
            </div>
          )}
          <input
            name="posterFile"
            type="file"
            accept="image/*"
            className="w-full cursor-pointer rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 file:mr-3 file:rounded-lg file:border file:border-saffron-200 file:bg-saffron-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-saffron-800"
          />
          <p className="text-xs text-stone-400">JPG/PNG/WebP · अधिकतम 3 MB · यह पोस्टर public website पर दिखेगा</p>
        </div>
      </Field>

      <Field label="विवरण" required><textarea name="description" defaultValue={event?.description} rows={5} required className={inputClass} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="संपर्क व्यक्ति"><input name="contactPerson" defaultValue={event?.contactPerson ?? ""} className={inputClass} /></Field>
        <Field label="संपर्क नंबर"><input name="contactNumber" defaultValue={event?.contactNumber ?? ""} className={inputClass} /></Field>
        <Field label="अधिकतम प्रतिभागी"><input name="maxParticipants" type="number" defaultValue={event?.maxParticipants ?? ""} className={inputClass} /></Field>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Field label="स्थिति">
          <select name="status" defaultValue={event?.status ?? "UPCOMING"} className={inputClass}>
            {EVENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <label className="mt-6 flex items-center gap-2 text-sm text-stone-600"><input type="checkbox" name="registrationRequired" defaultChecked={event?.registrationRequired} /> पंजीकरण आवश्यक</label>
        <label className="mt-6 flex items-center gap-2 text-sm text-stone-600"><input type="checkbox" name="featured" defaultChecked={event?.featured} /> Featured</label>
      </div>
      <button className="rounded-xl bg-saffron-600 px-6 py-2.5 font-medium text-white">सहेजें</button>
    </form>
  );
}
