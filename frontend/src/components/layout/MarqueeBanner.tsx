export function MarqueeBanner() {
  const content =
    "NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • ";

  return (
    <div className="w-full bg-primary py-3 overflow-hidden border-t border-b border-black">
      <div className="marquee-container">
        <div className="marquee-content font-mono font-bold text-black uppercase tracking-wider text-sm">
          {content}
        </div>
        <div
          aria-hidden="true"
          className="marquee-content font-mono font-bold text-black uppercase tracking-wider text-sm"
        >
          {content}
        </div>
      </div>
    </div>
  );
}
