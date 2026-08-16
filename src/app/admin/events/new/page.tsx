import Link from "next/link";
import { Card } from "@/components/ui/primitives";
import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <Link href="/admin/events" className="text-sm text-saffron-700">← सभी कार्यक्रम</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-ink">नया कार्यक्रम</h1>
      <Card className="p-6"><EventForm /></Card>
    </div>
  );
}
