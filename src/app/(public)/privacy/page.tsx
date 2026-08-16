import type { Metadata } from "next";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "गोपनीयता नीति" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-extrabold text-ink">गोपनीयता नीति</h1>
      <Card className="space-y-3 p-6 text-sm text-stone-600">
        <p>NYS आपकी व्यक्तिगत जानकारी की गोपनीयता का सम्मान करता है। हम केवल सदस्यता, दान एवं संपर्क हेतु आवश्यक जानकारी एकत्र करते हैं।</p>
        <p>दानदाता की निजी जानकारी सार्वजनिक नहीं की जाती। सदस्यों का मोबाइल नंबर केवल उनकी सहमति से दिखाया जाता है।</p>
        <p>भुगतान सुरक्षित गेटवे के माध्यम से होते हैं; हम कार्ड/बैंक विवरण संग्रहित नहीं करते।</p>
        <p>आपकी जानकारी किसी तीसरे पक्ष को व्यावसायिक उद्देश्य से साझा नहीं की जाती।</p>
      </Card>
    </div>
  );
}
