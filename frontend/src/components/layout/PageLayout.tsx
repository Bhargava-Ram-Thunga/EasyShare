import { type ReactNode } from "react";
import { Header } from "./Header";
import { Footer, MinimalFooter } from "./Footer";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
}

interface PageLayoutProps {
  children: ReactNode;
  headerVariant?: "default" | "glass";
  footerVariant?: "default" | "minimal";
  showFooter?: boolean;
  className?: string;
  backgroundEffects?: boolean;
  navItems?: NavItem[];
}

export function PageLayout({
  children,
  headerVariant = "default",
  footerVariant = "default",
  showFooter = true,
  className,
  backgroundEffects = true,
  navItems,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 bg-grain opacity-20 mix-blend-overlay overflow-hidden" />

      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)] overflow-hidden" />

      {backgroundEffects && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-accent-amber/5 blur-[120px]" />
        </div>
      )}

      <Header variant={headerVariant} navItems={navItems} />

      <main className={cn("flex-1 relative z-10 overflow-y-auto", className)}>{children}</main>

      {showFooter &&
        (footerVariant === "minimal" ? <MinimalFooter /> : <Footer />)}
    </div>
  );
}
