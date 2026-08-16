import Link from "next/link";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/primitives";

type Cat = { slug: string; name: string; icon?: string | null; color?: string | null; summary?: string | null };

// lucide dynamic icon
function Icon({ name, className, color }: { name?: string | null; className?: string; color?: string }) {
  const Cmp = (name && (Icons as unknown as Record<string, React.ComponentType<{ className?: string; color?: string }>>)[name]) || Icons.Sparkles;
  return <Cmp className={className} color={color} />;
}

export function ActivityCategories({ categories }: { categories: Cat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((c) => (
        <Link key={c.slug} href={`/activities?category=${c.slug}`}>
          <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <span
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${c.color ?? "#ea6205"}1a` }}
            >
              <Icon name={c.icon} className="h-6 w-6" color={c.color ?? "#ea6205"} />
            </span>
            <h3 className="font-semibold text-ink">{c.name}</h3>
            {c.summary && <p className="mt-1 line-clamp-2 text-xs text-stone-500">{c.summary}</p>}
          </Card>
        </Link>
      ))}
    </div>
  );
}
