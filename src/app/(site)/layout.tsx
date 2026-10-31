import { SmoothScroll } from "@/components/motion";
import { LeadProvider, MobileBar, SiteFooter, SiteHeader } from "@/components/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LeadProvider>
      <SmoothScroll />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <MobileBar />
    </LeadProvider>
  );
}
