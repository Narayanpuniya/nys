import { getHeroSlides } from "@/lib/settings";
import { HeroSlidesManager } from "./HeroSlidesManager";

export const dynamic = "force-dynamic";

export default async function HeroSlidesPage() {
  const slides = await getHeroSlides();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink">हीरो स्लाइडर प्रबंधन</h1>
        <p className="mt-1 text-sm text-stone-500">
          होम पेज के हीरो सेक्शन में दिखने वाली तस्वीरें यहाँ से जोड़ें या हटाएं।
        </p>
      </div>
      <HeroSlidesManager initialSlides={slides} />
    </div>
  );
}
