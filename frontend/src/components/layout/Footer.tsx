import { Link } from "react-router-dom";
import { Icon } from "../common";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-background-dark/80">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 mx-auto md:flex-row max-w-7xl">
        <div className="flex items-center gap-2 transition-opacity opacity-50 hover:opacity-100">
          <Icon name="share" className="text-primary" size="sm" />
          <span className="text-sm font-bold tracking-tight text-white">
            Easy Share
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link
            to="/docs"
            className="text-gray-400 transition-colors hover:text-white"
          >
            Documentation
          </Link>
          <Link
            to="/privacy"
            className="text-gray-400 transition-colors hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-gray-400 transition-colors hover:text-white"
          >
            Terms of Service
          </Link>
          <a
            href="https://github.com/Bhargava-Ram-Thunga/EasyShare"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>

        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Easy Share Inc.
        </div>
      </div>
    </footer>
  );
}

export function MinimalFooter() {
  return (
    <footer className="w-full border-t border-white/5 bg-background-dark">
      <div className="flex flex-col items-center justify-between gap-6 px-6 py-8 mx-auto md:flex-row lg:px-12 max-w-7xl">
        <div className="flex items-center gap-2 transition-opacity opacity-50 hover:opacity-100">
          <Icon name="share" className="text-primary" size="sm" />
          <span className="font-bold tracking-tight text-white">
            Easy Share
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
          <Link to="/docs" className="text-gray-400 transition-colors hover:text-white">
            Documentation
          </Link>
          <Link to="/privacy" className="text-gray-400 transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-gray-400 transition-colors hover:text-white">
            Terms of Service
          </Link>
          <a
            href="https://github.com/Bhargava-Ram-Thunga/EasyShare"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>

        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Easy Share Inc.
        </div>
      </div>
    </footer>
  );
}
