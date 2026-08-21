import { prisma } from "@/lib/db";
import { Card, Badge, inputClass } from "@/components/ui/primitives";
import { SUGGESTION_STATUS } from "@/lib/constants";
import { formatDateHi } from "@/lib/utils";
import { updateSuggestion } from "./actions";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
  const items = await prisma.suggestion.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">सुझाव व समस्याएँ ({items.length})</h1>
        <a href="/api/admin/export/suggestions" className="text-sm text-green-700">Excel ↓</a>
      </div>
      <div className="space-y-3">
        {items.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-ink">{s.subject}</h3>
                <div className="text-xs text-stone-400">{s.name} · {s.category} · {formatDateHi(s.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={s.status === "NEW" ? "amber" : s.status === "IMPLEMENTED" ? "green" : "neutral"}>{s.status}</Badge>
                <AdminDeleteButton entity="suggestion" id={s.id} label={s.subject} />
              </div>
            </div>
            <p className="mt-2 text-sm text-stone-600">{s.body}</p>
            <form action={updateSuggestion.bind(null, s.id)} className="mt-3 flex flex-wrap items-center gap-2">
              <select name="status" defaultValue={s.status} className={`${inputClass} w-40`}>
                {SUGGESTION_STATUS.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
              <input name="adminReply" defaultValue={s.adminReply ?? ""} placeholder="प्रतिक्रिया (वैकल्पिक)" className={`${inputClass} flex-1`} />
              <button className="rounded-xl bg-saffron-600 px-4 py-2 text-sm font-medium text-white">सहेजें</button>
            </form>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-stone-400">कोई सुझाव नहीं।</p>}
      </div>
    </div>
  );
}
