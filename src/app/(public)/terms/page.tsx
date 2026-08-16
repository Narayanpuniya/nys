import type { Metadata } from "next";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "नियम व शर्तें" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-extrabold text-ink">नियम व शर्तें</h1>
      <Card className="space-y-3 p-6 text-sm text-stone-600">
        <p>NYS की सदस्यता एवं दान स्वैच्छिक हैं। सदस्यता शुल्क एवं दान संस्था के सामाजिक कार्यों हेतु उपयोग किए जाते हैं।</p>
        <p>सदस्यता अवधि योजना अनुसार मान्य रहती है। नवीनीकरण सदस्य की जिम्मेदारी है।</p>
        <p>दान सामान्यतः अप्रतिदेय (non-refundable) होते हैं। किसी त्रुटि की स्थिति में संस्था से संपर्क करें।</p>
        <p>संस्था इन शर्तों को समय-समय पर अद्यतन करने का अधिकार रखती है।</p>
      </Card>
    </div>
  );
}
