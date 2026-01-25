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

const navIconMap: Record<string, string> = {
  Share: "upload",
  Receive: "download",
  Files: "description",
  History: "history",
};

export function Header({
  variant = "default",
  navItems = defaultNavItems,
  showMobileMenu = true
}: HeaderProps) {
  const variants = {
    default: "relative",
    glass: "relative",
  };

  return (
    <header
      className={cn(
        "w-full px-6 py-4 flex items-center justify-between z-50",
        variant === "glass" && "sticky top-0",
        variants[variant],
      )}
    >
      {variant === "default" ? (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2422]/90 via-[#0f2422]/60 to-transparent backdrop-blur-2xl -z-10" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2422]/60 via-[#0f2422]/30 to-transparent backdrop-blur-2xl -z-10" />
      )}

      <Link to="/" className="flex items-center gap-3">
        <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20">
          <Icon name="share" size="sm" />
        </div>
        <h1 className="text-xl font-bold tracking-tight uppercase text-white">
          Easy Share
        </h1>
      </Link>

      {navItems.length > 0 && (
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-primary transition-all duration-500 ease-out"
            >
              <Icon
                name={navIconMap[item.label] || "circle"}
                size="sm"
                className="transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_10px_rgba(0,255,230,0.8)]"
              />
              <span className="transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_8px_rgba(0,255,230,0.6)]">
                {item.label}
              </span>
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
