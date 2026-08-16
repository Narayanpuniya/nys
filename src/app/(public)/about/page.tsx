import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ACTIVITY_CATEGORIES } from "@/lib/constants";
import { getI18n } from "@/lib/i18n";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { LogoMark } from "@/components/ui/Logo";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.about_title };
}

export const revalidate = 300;

export default async function AboutPage() {
  const [s, { dict }] = await Promise.all([getSettings(), getI18n()]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark className="h-16 w-16" imageUrl={s.logoUrl} />
        <h1 className="mt-3 text-3xl font-extrabold text-ink">{s.name}</h1>
        <p className="mt-2 max-w-2xl text-stone-600">{s.tagline}</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-ink">{dict.about_intro_title}</h2>
        <p className="mt-2 text-stone-600">{dict.about_intro_body}</p>
      </Card>

      <div className="mt-8">
        <SectionHeading title={dict.about_areas} viewAllLabel={dict.viewAll} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITY_CATEGORIES.map((c) => (
            <Card key={c.slug} className="p-4">
              <div className="font-semibold text-ink" style={{ color: c.color }}>{c.name}</div>
              <p className="mt-1 text-xs text-stone-500">{c.summary}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5 text-center">
          <div className="text-2xl">🎯</div>
          <h3 className="mt-1 font-bold text-ink">{dict.about_goal}</h3>
          <p className="mt-1 text-sm text-stone-500">{dict.about_goal_body}</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="text-2xl">🤝</div>
          <h3 className="mt-1 font-bold text-ink">{dict.about_values}</h3>
          <p className="mt-1 text-sm text-stone-500">{dict.about_values_body}</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="text-2xl">🌱</div>
          <h3 className="mt-1 font-bold text-ink">{dict.about_vision}</h3>
          <p className="mt-1 text-sm text-stone-500">{dict.about_vision_body}</p>
        </Card>
      </div>

      {s.legal.showLegalOnSite && (s.legal.registrationNo || s.legal.pan) && (
        <Card className="mt-8 p-5 text-sm text-stone-600">
          <h3 className="mb-2 font-bold text-ink">{dict.about_legal}</h3>
          {s.legal.registrationNo && <p>{dict.about_reg_no}: {s.legal.registrationNo}</p>}
          {s.legal.pan && <p>PAN: {s.legal.pan}</p>}
          {s.legal.has80G && <p>80G</p>}
          {s.legal.has12A && <p>12A</p>}
        </Card>
      )}
    </div>
  );
}
