export function ReceivingHeader({
  title = "Receiving File...",
  subtitle = "Secure peer-to-peer connection established.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-2">
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-1.5 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        Incoming Transmission
      </div>

      <h1 className="text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">
        {title}
      </h1>

      <p className="text-gray-400 mt-0.5 text-xs">{subtitle}</p>
    </div>
  );
}
