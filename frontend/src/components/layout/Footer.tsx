import { Link } from "react-router-dom";
import { Icon } from "../common";

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/5 bg-background-dark/80 px-6 lg:px-10 py-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <Icon name="share" className="text-primary" size="sm" />
          <span className="text-white font-bold tracking-tight">
            Easy Share
          </span>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <Link
            to="/privacy"
            className="text-gray-500 hover:text-white text-xs font-medium transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-gray-500 hover:text-white text-xs font-medium transition-colors"
          >
            Terms of Service
          </Link>
          <a
            href="https://github.com/Bhargava-Ram-Thunga/EasyShare"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white text-xs font-medium transition-colors"
          >
            Github
          </a>
        </div>

        <div className="text-gray-600 text-sm">
          © {new Date().getFullYear()} Easy Share Inc.
        </div>
      </div>
    </footer>
  );
}

export function MinimalFooter() {
  return (
    <footer className="w-full border-t border-white/5 bg-background-dark py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <Icon name="share" className="text-primary" size="sm" />
          <span className="text-white font-bold tracking-tight">
            Easy Share
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <a
            href="https://github.com/Bhargava-Ram-Thunga/EasyShare"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Github
          </a>
        </div>
        <div className="text-gray-600 text-sm">
          © {new Date().getFullYear()} Easy Share Inc.
        </div>
      </div>
    </footer>
  );
}
