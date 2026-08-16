import { saveCampaign } from "@/app/admin/campaigns/actions";
import { Field, inputClass } from "@/components/ui/primitives";
import { CAMPAIGN_STATUS } from "@/lib/constants";

type Campaign = {
  id: string; title: string; goalAmount: number; category: string; beneficiary: string | null;
  location: string | null; description: string; coverImage: string | null; status: string;
  featured: boolean; endDate: Date | null;
};

export function CampaignForm({ campaign }: { campaign?: Campaign }) {
  const end = campaign?.endDate ? new Date(campaign.endDate).toISOString().slice(0, 10) : "";
  return (
    <form action={saveCampaign} className="space-y-4">
      {campaign && <input type="hidden" name="id" value={campaign.id} />}
      <Field label="शीर्षक" required><input name="title" defaultValue={campaign?.title} required className={inputClass} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="लक्ष्य राशि (₹)" required><input name="goalAmount" type="number" defaultValue={campaign?.goalAmount} required className={inputClass} /></Field>
        <Field label="श्रेणी"><input name="category" defaultValue={campaign?.category ?? "GENERAL"} className={inputClass} /></Field>
        <Field label="समाप्ति तिथि"><input name="endDate" type="date" defaultValue={end} className={inputClass} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="लाभार्थी"><input name="beneficiary" defaultValue={campaign?.beneficiary ?? ""} className={inputClass} /></Field>
        <Field label="स्थान"><input name="location" defaultValue={campaign?.location ?? ""} className={inputClass} /></Field>
      </div>
      <Field label="कवर चित्र URL"><input name="coverImage" defaultValue={campaign?.coverImage ?? ""} className={inputClass} /></Field>
      <Field label="विवरण" required><textarea name="description" defaultValue={campaign?.description} rows={6} required className={inputClass} /></Field>
      <div className="flex flex-wrap items-center gap-4">
        <Field label="स्थिति">
          <select name="status" defaultValue={campaign?.status ?? "ACTIVE"} className={inputClass}>
            {CAMPAIGN_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <label className="mt-6 flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" name="featured" defaultChecked={campaign?.featured} /> Featured
        </label>
      </div>
      <button className="rounded-xl bg-saffron-600 px-6 py-2.5 font-medium text-white">सहेजें</button>
    </form>
  );
}
