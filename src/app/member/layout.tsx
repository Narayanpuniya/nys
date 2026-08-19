import { InactivityWatcher } from "@/components/ui/InactivityWatcher";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InactivityWatcher logoutUrl="/member/logout" />
    </>
  );
}
