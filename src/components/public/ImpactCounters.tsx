"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users, CalendarCheck, School, GraduationCap, TreePine, HandHeart, HandCoins,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { formatINR, formatNumber } from "@/lib/utils";
import type { DictKey } from "@/lib/i18n/dictionaries";

type Props = {
  data: {
    totalMembers: number;
    totalPrograms: number;
    schoolsSupported: number;
    studentsBenefited: number;
    trees: number;
    volunteers: number;
    totalDonations: number;
    totalIncome: number;
    totalExpense: number;
  };
  dict: Record<DictKey, string>;
};

const items = (d: Props["data"], dict: Props["dict"]) => [
  { icon: Users,       label: dict.impact_members,     value: d.totalMembers,                        color: "#7c3aed" },
  { icon: CalendarCheck, label: dict.impact_programs,  value: d.totalPrograms,                       color: "#2563eb" },
  { icon: School,      label: dict.impact_schools,      value: d.schoolsSupported,                    color: "#0891b2" },
  { icon: GraduationCap, label: dict.impact_students,  value: d.studentsBenefited,                   color: "#ea6205" },
  { icon: TreePine,    label: dict.impact_trees,        value: d.trees,                               color: "#16a34a" },
  { icon: HandHeart,   label: dict.impact_volunteers,   value: d.volunteers,                          color: "#dc2626" },
  { icon: HandCoins,   label: dict.impact_donations,    value: d.totalDonations, money: true,         color: "#c24807" },
  { icon: TrendingUp,  label: dict.impact_income,       value: d.totalIncome,  money: true,           color: "#166534" },
  { icon: TrendingDown, label: dict.impact_expense,     value: d.totalExpense, money: true,           color: "#991b1b" },
];

function useCountUp(target: number, run: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return val;
}

function Counter({ item, run }: { item: ReturnType<typeof items>[number]; run: boolean }) {
  const val = useCountUp(item.value, run);
  const Icon = item.icon;
  return (
    <Card className="flex items-center gap-3 p-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${item.color}1a`, color: item.color }}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <div className="text-xl font-extrabold text-ink">
          {item.money ? formatINR(val) : formatNumber(val)}
        </div>
        <div className="truncate text-xs text-stone-500">{item.label}</div>
      </div>
    </Card>
  );
}

export function ImpactCounters({ data, dict }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items(data, dict).map((it) => (
        <Counter key={it.label} item={it} run={run} />
      ))}
    </div>
  );
}
