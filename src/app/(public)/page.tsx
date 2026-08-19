import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings, getHeroSlides } from "@/lib/settings";
import { getImpactCounters } from "@/lib/stats";
import { clampPercent } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { HeroSlider } from "@/components/public/HeroSlider";
import { ImpactCounters } from "@/components/public/ImpactCounters";
import { ActivityCategories } from "@/components/public/ActivityCategories";
import { ActivitiesFeed } from "@/components/public/ActivitiesFeed";
import { CampaignCard, type CampaignCardData } from "@/components/public/CampaignCard";
import { EventCard } from "@/components/public/EventCard";
import { LeadershipStrip } from "@/components/public/LeadershipStrip";
import { SectionHeading, EmptyState, Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 60;

async function getFeaturedCampaign() {
  try {
    const c =
      (await prisma.campaign.findFirst({ where: { status: "ACTIVE", featured: true } })) ??
      (await prisma.campaign.findFirst({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }));
    if (!c) return null;
    const agg = await prisma.donation.aggregate({
      where: { campaignId: c.id, status: "SUCCESS" },
      _sum: { amount: true },
      _count: true,
    });
    const collected = agg._sum.amount ?? 0;
    return {
      slug: c.slug,
      title: c.title,
      coverImage: c.coverImage,
      goal: c.goalAmount,
      collected,
      remaining: Math.max(0, c.goalAmount - collected),
      percent: clampPercent(collected, c.goalAmount),
      donors: agg._count,
      status: c.status,
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const { dict } = await getI18n();
  const settings = await getSettings();
  const counters = await getImpactCounters();
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let featured: Awaited<ReturnType<typeof getFeaturedCampaign>> = null;
  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  let leadership: Awaited<ReturnType<typeof prisma.teamMember.findMany>> = [];
  let mentors: Awaited<ReturnType<typeof prisma.mentor.findMany>> = [];
  let partners: Awaited<ReturnType<typeof prisma.partner.findMany>> = [];
  let heroSlides: { imageUrl: string; title?: string | null; category?: string | null }[] = [];

  try {
    const [cats, feat, evts, leads, mnts, parts, rawSlides] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      getFeaturedCampaign(),
      prisma.event.findMany({ where: { status: "UPCOMING" }, orderBy: { date: "asc" }, take: 3 }),
      prisma.teamMember.findMany({ where: { isLeadership: true }, orderBy: { sortOrder: "asc" } }),
      prisma.mentor.findMany({ where: { featured: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
      prisma.partner.findMany({ where: { featured: true }, orderBy: { createdAt: "desc" }, take: 6 }),
      getHeroSlides(),
    ]);
    categories = cats; featured = feat; events = evts;
    leadership = leads; mentors = mnts; partners = parts;
    // Admin द्वारा जोड़ी गई slides, sortOrder के अनुसार
    heroSlides = rawSlides
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({ imageUrl: s.imageUrl, title: s.title }));
  } catch (err) {
    console.error("[HomePage] database unavailable:", err);
  }

  const campaignCard: CampaignCardData | null = featured;

  return (
    <>
      <HeroSlider
        tagline={settings.tagline}
        slides={heroSlides}
        campaign={featured}
        dict={dict}
        logoUrl={settings.logoUrl}
        orgName={settings.name}
        orgAddress={settings.address}
      />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading title={dict.home_impact} subtitle={dict.home_impact_sub} viewAllLabel={dict.viewAll} />
        <ImpactCounters data={counters} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <Card className="grid gap-6 p-6 lg:grid-cols-3 lg:p-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-ink">{dict.home_about}</h2>
            <p className="mt-3 text-stone-600">{dict.home_about_body}</p>
            <ButtonLink href="/about" variant="outline" className="mt-4">{dict.learnMore}</ButtonLink>
          </div>
          <div className="rounded-2xl bg-saffron-50 p-5">
            <h3 className="font-semibold text-saffron-900">{dict.home_areas}</h3>
            <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-stone-600">
              <li>• {dict.area_shiksha}</li><li>• {dict.area_khel}</li>
              <li>• {dict.area_paryavaran}</li><li>• {dict.area_heritage}</li>
              <li>• {dict.area_samajik}</li><li>• {dict.area_yuva}</li>
              <li>• {dict.area_school}</li><li>• {dict.area_innovation}</li>
            </ul>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading title={dict.home_activities} subtitle={dict.home_activities_sub} viewAllHref="/activities" viewAllLabel={dict.viewAll} />
        <ActivityCategories categories={categories} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div>
          <SectionHeading title={dict.home_campaign} viewAllHref="/campaigns" viewAllLabel={dict.viewAll} />
          {campaignCard ? (
            <CampaignCard c={campaignCard} />
          ) : (
            <EmptyState message={dict.home_no_campaign} />
          )}
        </div>
        <div>
          <SectionHeading title={dict.home_events} viewAllHref="/events" viewAllLabel={dict.viewAll} />
          {events.length ? (
            <div className="space-y-3">
              {events.map((e) => (
                <EventCard
                  key={e.id}
                  e={{
                    slug: e.slug, title: e.title, date: e.date.toISOString(), time: e.time,
                    venue: e.venue, posterImage: e.posterImage, status: e.status, category: e.category,
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState message={dict.home_no_events} />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading
          title={dict.home_latest}
          subtitle={dict.home_latest_sub}
          viewAllHref="/activities"
          viewAllLabel={dict.viewAll}
        />
        <ActivitiesFeed categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading title={dict.home_leadership} subtitle={dict.home_leadership_sub} viewAllHref="/team" viewAllLabel={dict.viewAll} />
        <LeadershipStrip leaders={leadership.map((l) => ({
          name: l.name, designation: l.designation, photoUrl: l.photoUrl,
          mobile: l.showMobile ? l.mobile : null, responsibility: l.responsibility,
        }))} />
      </section>

      {mentors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionHeading title={dict.home_mentors} viewAllHref="/mentors" viewAllLabel={dict.viewAll} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((m) => (
              <Card key={m.id} className="p-5 text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-saffron-100 text-2xl">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={m.name} className="h-20 w-20 rounded-full object-cover" />
                  ) : "🧑‍🏫"}
                </div>
                <h3 className="font-semibold text-ink">{m.name}</h3>
                <p className="text-xs text-stone-500">{m.designation}</p>
                {m.contribution && <p className="mt-2 line-clamp-2 text-xs text-stone-500">{m.contribution}</p>}
              </Card>
            ))}
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionHeading title={dict.home_partners} subtitle={dict.home_partners_sub} viewAllHref="/partners" viewAllLabel={dict.viewAll} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((p) => (
              <Link key={p.id} href={`/partners/${p.slug}`}>
                <Card className="flex h-24 items-center justify-center p-3 text-center transition hover:shadow-md">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt={p.name} className="max-h-16 object-contain" />
                  ) : (
                    <span className="text-sm font-medium text-stone-600">{p.name}</span>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl nys-accent-bar p-8 text-white">
            <h3 className="text-2xl font-bold">{dict.home_join_title}</h3>
            <p className="mt-2 text-white/90">{dict.home_join_body}</p>
            <ButtonLink href="/join" variant="secondary" className="mt-4 bg-white text-saffron-800 hover:bg-saffron-50">
              {dict.home_join_cta}
            </ButtonLink>
          </div>
          <div className="rounded-3xl border-2 border-saffron-200 bg-white p-8">
            <h3 className="text-2xl font-bold text-ink">{dict.home_donate_title}</h3>
            <p className="mt-2 text-stone-600">{dict.home_donate_body}</p>
            <ButtonLink href="/donate" className="mt-4">{dict.home_donate_cta}</ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/transparency">
            <Card className="flex items-center justify-between p-6 transition hover:shadow-md">
              <div>
                <h3 className="text-lg font-bold text-ink">{dict.home_transparency}</h3>
                <p className="text-sm text-stone-500">{dict.home_transparency_sub}</p>
              </div>
              <span className="text-2xl">📊</span>
            </Card>
          </Link>
          <Link href="/contact">
            <Card className="flex items-center justify-between p-6 transition hover:shadow-md">
              <div>
                <h3 className="text-lg font-bold text-ink">{dict.home_contact}</h3>
                <p className="text-sm text-stone-500">{settings.mobile} · {settings.email}</p>
              </div>
              <span className="text-2xl">📞</span>
            </Card>
          </Link>
        </div>
      </section>
    </>
  );
}
