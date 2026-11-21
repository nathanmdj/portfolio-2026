/** Green dot with a slow outward ping, marking something that is live right now. */
export function StatusDot() {
  return (
    <span aria-hidden="true" className="relative size-2 shrink-0 rounded-full bg-accent">
      <span className="absolute -inset-1 rounded-full border border-accent opacity-0 motion-safe:animate-ping-soft" />
    </span>
  );
}
