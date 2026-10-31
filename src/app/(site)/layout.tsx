import { LeadProvider, SiteFooter, SiteHeader } from "@/components/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LeadProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </LeadProvider>
  );
}
