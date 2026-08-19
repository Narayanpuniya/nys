import { Header } from "@/components/public/Header";
import { TopBar } from "@/components/public/TopBar";
import { Footer } from "@/components/public/Footer";
import { MobileBottomNav } from "@/components/public/MobileBottomNav";
import { getSettings } from "@/lib/settings";
import { getI18n } from "@/lib/i18n";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, { locale, dict }] = await Promise.all([getSettings(), getI18n()]);
  return (
    <>
      <TopBar s={settings} />
      <Header
        logoUrl={settings.logoUrl}
        locale={locale}
        dict={dict}
        registrationNo={settings.legal?.registrationNo}
        orgName={settings.name}
        orgPlace={settings.address}
      />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav dict={dict} />
    </>
  );
}
