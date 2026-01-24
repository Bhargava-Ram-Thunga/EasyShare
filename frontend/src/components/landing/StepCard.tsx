import { Icon } from "../common";

interface StepCardProps {
  step: number;
  icon: string;
  title: string;
  description: string;
}

export function StepCard({ step, icon, title, description }: StepCardProps) {
  return (
    <div className="relative z-10 group">
      <div className="bg-surface-dark border border-white/5 hover:border-primary/50 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col gap-6">
        <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
          <Icon name={icon} size="lg" />
        </div>

        <div>
          <span className="text-xs font-mono text-gray-500 mb-2 block">
            STEP {step.toString().padStart(2, "0")}
          </span>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
