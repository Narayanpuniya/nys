import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatINR } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type FeaturedCampaign = {
  slug: string;
  title: string;
  collected: number;
  goal: number;
  percent: number;
} | null;

export function Hero({
  tagline,
  campaign,
  dict,
}: {
  tagline: string;
  campaign: FeaturedCampaign;
  dict: Dictionary;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron-50 via-cream to-maroon-50" />
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-saffron-200/30 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-white/70 px-3 py-1 text-xs font-medium text-saffron-800">
            <LogoMark className="h-5 w-5" /> {dict.hero_badge}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-5xl">
            {tagline}
          </h1>
          <p className="mt-4 max-w-xl text-stone-600">{dict.hero_intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/join" size="lg">{dict.hero_join}</ButtonLink>
            <ButtonLink href="/donate" size="lg" variant="secondary">{dict.hero_donate}</ButtonLink>
            <ButtonLink href="/activities" size="lg" variant="outline">{dict.hero_activities}</ButtonLink>
          </div>
        </div>

        {campaign ? (
          <div className="rounded-3xl border border-saffron-100 bg-white/90 p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-saffron-700">
              {dict.hero_campaign}
            </p>
            <h2 className="mt-1 text-xl font-bold text-ink">{campaign.title}</h2>
            <div className="mt-4">
              <ProgressBar percent={campaign.percent} />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-extrabold text-saffron-800">{formatINR(campaign.collected)}</div>
                  <div className="text-[11px] text-stone-500">{dict.hero_collected}</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-ink">{campaign.percent}%</div>
                  <div className="text-[11px] text-stone-500">{dict.hero_complete}</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-maroon-700">{formatINR(campaign.goal)}</div>
                  <div className="text-[11px] text-stone-500">{dict.hero_goal}</div>
                </div>
              </div>
            </div>
            <ButtonLink href={`/campaigns/${campaign.slug}`} className="mt-5 w-full">
              {dict.hero_view_campaign}
            </ButtonLink>
          </div>
        ) : (
          <div className="rounded-3xl border border-saffron-100 bg-white/90 p-8 text-center shadow-xl">
            <div className="text-5xl">🪔</div>
            <p className="mt-3 font-semibold text-ink">{dict.hero_welcome_title}</p>
            <p className="mt-1 text-sm text-stone-500">{dict.hero_welcome_body}</p>
          </div>
        )}
      </div>
    </section>
  );
}
