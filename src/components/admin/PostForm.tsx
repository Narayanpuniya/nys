import { savePost } from "@/app/admin/posts/actions";
import { Field, inputClass } from "@/components/ui/primitives";
import { POST_STATUS } from "@/lib/constants";

type Post = {
  id: string; title: string; categoryId: string | null; location: string | null;
  excerpt: string | null; content: string; mainImage: string | null; youtubeUrl: string | null;
  facebookUrl: string | null; impactNumber: number | null; impactLabel: string | null;
  status: string; featured: boolean; date: Date;
};

export function PostForm({ post, categories }: { post?: Post; categories: { id: string; name: string }[] }) {
  const d = post?.date ? new Date(post.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  return (
    <form action={savePost} className="space-y-4">
      {post && <input type="hidden" name="id" value={post.id} />}
      <Field label="शीर्षक" required><input name="title" defaultValue={post?.title} required className={inputClass} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="श्रेणी">
          <select name="categoryId" defaultValue={post?.categoryId ?? ""} className={inputClass}>
            <option value="">— चुनें —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="स्थान"><input name="location" defaultValue={post?.location ?? ""} className={inputClass} /></Field>
        <Field label="दिनांक"><input name="date" type="date" defaultValue={d} className={inputClass} /></Field>
      </div>
      <Field label="संक्षिप्त विवरण"><input name="excerpt" defaultValue={post?.excerpt ?? ""} className={inputClass} /></Field>
      <Field label="विस्तृत विवरण" required><textarea name="content" defaultValue={post?.content} rows={8} required className={inputClass} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="मुख्य चित्र URL"><input name="mainImage" defaultValue={post?.mainImage ?? ""} className={inputClass} placeholder="https://..." /></Field>
        <Field label="YouTube URL"><input name="youtubeUrl" defaultValue={post?.youtubeUrl ?? ""} className={inputClass} /></Field>
        <Field label="Facebook URL"><input name="facebookUrl" defaultValue={post?.facebookUrl ?? ""} className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="प्रभाव संख्या"><input name="impactNumber" type="number" defaultValue={post?.impactNumber ?? ""} className={inputClass} /></Field>
          <Field label="प्रभाव लेबल"><input name="impactLabel" defaultValue={post?.impactLabel ?? ""} className={inputClass} placeholder="विद्यार्थी" /></Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Field label="स्थिति">
          <select name="status" defaultValue={post?.status ?? "DRAFT"} className={inputClass}>
            {POST_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <label className="mt-6 flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" name="featured" defaultChecked={post?.featured} /> Featured (होमपेज पर)
        </label>
      </div>
      <button className="rounded-xl bg-saffron-600 px-6 py-2.5 font-medium text-white hover:bg-saffron-700">सहेजें</button>
    </form>
  );
}
