export function SiteFooter() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div
        className="@container mx-auto"
        style={{
          maxWidth: "var(--frame-max)",
          paddingInline: "var(--frame-gutter)",
          paddingBlock: "2.5rem",
        }}
      >
        <footer className="flex flex-col gap-3">
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
        </footer>
      </div>
    </div>
  );
}
