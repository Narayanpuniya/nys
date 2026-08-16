import { saveEvent } from "@/app/admin/events/actions";
import { Field, inputClass } from "@/components/ui/primitives";
import { EVENT_STATUS } from "@/lib/constants";

type Event = {
  id: string; title: string; category: string; description: string; date: Date; time: string | null;
  venue: string | null; mapUrl: string | null; posterImage: string | null; registrationRequired: boolean;
  maxParticipants: number | null; contactPerson: string | null; contactNumber: string | null;
  status: string; featured: boolean;
};

export function EventForm({ event }: { event?: Event }) {
  const date = event?.date ? new Date(event.date).toISOString().slice(0, 10) : "";
  return (
    <form action={saveEvent} className="space-y-4">
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
      <Field label="पोस्टर URL"><input name="posterImage" defaultValue={event?.posterImage ?? ""} className={inputClass} /></Field>
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
