import { useNavigate } from "react-router-dom";
import { Button, Icon } from "../common";

export function HeroBanner() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 text-left max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary uppercase tracking-widest">
            v2.0 Live Now
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter text-white">
          Share files. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 text-glow">
            Not your data.
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-lg font-light leading-relaxed">
          P2P encryption. No servers. No limits. The fastest way to move data
          across the web, anonymously.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          variant="primary"
          size="lg"
          icon="download"
          iconPosition="left"
          className="h-14 px-8 text-lg"
          onClick={() => navigate("/receive")}
        >
          Receive Files
        </Button>
      </div>

      <div className="flex items-center gap-6 text-gray-500 text-sm font-mono pt-4">
        <span className="flex items-center gap-2">
          <Icon name="check_circle" size="sm" /> End-to-end Encrypted
        </span>
        <span className="flex items-center gap-2">
          <Icon name="bolt" size="sm" /> Lightning Fast
        </span>
      </div>
    </div>
  );
}
