import { Link } from "react-router-dom";
import { Icon } from "../common";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
}

interface HeaderProps {
  variant?: "default" | "glass";
  navItems?: NavItem[];
  showMobileMenu?: boolean;
}

const defaultNavItems: NavItem[] = [
  { to: "/files", label: "Files" },
  { to: "/history", label: "History" },
];

export function Header({
  variant = "default",
  navItems = defaultNavItems,
  showMobileMenu = true
}: HeaderProps) {
  const variants = {
    default: "border-b border-border-dark bg-[#0f2422]/90 backdrop-blur-md",
    glass: "glass-panel border-white/5",
  };

  return (
    <header
      className={cn(
        "w-full px-6 py-4 flex items-center justify-between sticky top-0 z-50",
        variants[variant],
      )}
    >
      <Link to="/" className="flex items-center gap-3">
        <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20">
          <Icon name="share" size="sm" />
        </div>
        <h1 className="text-xl font-bold tracking-tight uppercase text-white">
          Easy Share
        </h1>
      </Link>

      {navItems.length > 0 && (
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-gray-400 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {showMobileMenu && (
        <button className="md:hidden text-white">
          <Icon name="menu" size="lg" />
        </button>
      )}
    </header>
  );
}
