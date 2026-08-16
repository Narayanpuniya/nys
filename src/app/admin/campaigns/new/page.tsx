import Link from "next/link";
import { Card } from "@/components/ui/primitives";
import { CampaignForm } from "@/components/admin/CampaignForm";

export default function NewCampaignPage() {
  return (
    <div>
      <Link href="/admin/campaigns" className="text-sm text-saffron-700">← सभी अभियान</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-ink">नया अभियान</h1>
      <Card className="p-6"><CampaignForm /></Card>
    </div>
  );
}
