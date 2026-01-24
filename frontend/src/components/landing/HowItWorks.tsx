import { Icon } from '../common';
import { StepCard } from './StepCard';

const steps = [
  {
    step: 1,
    icon: 'upload_file',
    title: 'Drop File',
    description:
      'Drag your files into the secure zone. Encryption happens instantly in your browser before upload.',
  },
  {
    step: 2,
    icon: 'link',
    title: 'Get Link',
    description:
      'Instant generated encrypted link. Share it via email, slack, or carrier pigeon.',
  },
  {
    step: 3,
    icon: 'download',
    title: 'Peer Download',
    description:
      'Direct P2P transfer to recipient. Once they download, the file disappears from our cache.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative z-10 w-full bg-surface-darker/50 border-t border-white/5 py-20 px-6 lg:px-12 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-md">
              Secure sharing in three simple steps. We remove the middleman so
              your data stays yours.
            </p>
          </div>
          <a
            href="#"
            className="text-primary hover:text-white font-bold flex items-center gap-2 transition-colors group"
          >
            View Documentation
            <Icon
              name="arrow_right_alt"
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent border-t border-dashed border-primary/30 z-0" />

          {steps.map((step) => (
            <StepCard key={step.step} {...step} />
          ))}
        </div>
      </div>
    </section >
  );
}