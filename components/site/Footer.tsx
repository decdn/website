export function Footer() {
  return (
    <footer
      className="bg-paper pt-16 pb-10 text-ink"
      style={{ paddingInline: "var(--frame-gutter)" }}
    >
      <div
        className="@container mx-auto flex flex-col gap-3"
        style={{ maxWidth: "var(--frame-max)" }}
      >
        <span aria-hidden className="rule opacity-40" />
        <div
          className="grid grid-cols-1 gap-2 tracking-[0.2em] uppercase opacity-80 @md:grid-cols-3 @md:items-center"
          style={{ fontSize: "var(--fs-micro)" }}
        >
          <span>© decdn labs · open source</span>
          <span className="@md:text-center">
            built in rust · probably over-engineered
          </span>
          <span className="tabular-nums @md:text-right">node-001 / v0</span>
        </div>
      </div>
    </footer>
  );
}
