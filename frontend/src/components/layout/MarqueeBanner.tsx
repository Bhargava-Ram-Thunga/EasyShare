export function MarqueeBanner() {
  const content =
    "NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • NO LOGS • END-TO-END ENCRYPTION • OPEN SOURCE • ";

  return (
    <div className="w-full py-3 overflow-hidden border-t border-b border-black bg-primary">
      <div className="marquee-container">
        <div className="font-mono text-sm font-bold tracking-wider text-black uppercase marquee-content">
          {content}
        </div>
        <div
          aria-hidden="true"
          className="font-mono text-sm font-bold tracking-wider text-black uppercase marquee-content"
        >
          {content}
        </div>
      </div>
    </div>
  );
}
