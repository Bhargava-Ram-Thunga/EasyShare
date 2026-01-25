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
    <div className="flex flex-col min-h-screen overflow-x-hidden text-white bg-background-dark">
      <div className="fixed inset-0 z-50 pointer-events-none bg-grain opacity-20 mix-blend-overlay" />

      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      {backgroundEffects && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-accent-amber/5 blur-[120px]" />
        </div>
      )}

      <Header variant={headerVariant} navItems={navItems} />

      <main className={cn("relative z-10 flex-1 flex flex-col", className)}>{children}</main>

      {showFooter &&
        (footerVariant === "minimal" ? <MinimalFooter /> : <Footer />)}
    </div>
  );
}
