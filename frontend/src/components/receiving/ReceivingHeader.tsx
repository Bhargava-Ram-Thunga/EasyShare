export function ReceivingHeader({
  title = "Receiving File...",
  subtitle = "Secure peer-to-peer connection established.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Incoming Transmission
      </div>

      <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight tracking-tight">
        {title}
      </h1>

      <p className="text-gray-400 mt-2 text-lg">{subtitle}</p>
    </div>
  );
}
