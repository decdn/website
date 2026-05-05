type Node = {
  id: string;
  active: boolean;
  rate: string;
};

const NODES: readonly Node[] = [
  { id: "ber-14", active: true, rate: "2.4 GB/s" },
  { id: "icn-03", active: true, rate: "1.8 GB/s" },
  { id: "sfo-22", active: true, rate: "3.1 GB/s" },
  { id: "tyo-05", active: true, rate: "4.2 GB/s" },
  { id: "fra-11", active: true, rate: "2.1 GB/s" },
  { id: "sgp-02", active: true, rate: "1.5 GB/s" },
  { id: "nyc-07", active: false, rate: "idle" },
  { id: "lax-17", active: false, rate: "idle" },
] as const;

export function FleetStatus({ className }: { className?: string }) {
  const active = NODES.filter((n) => n.active).length;
  return (
    <div aria-hidden className={className}>
      <div className="fleet">
        <div className="fleet-head">
          <span className="fleet-dot" />
          <span className="fleet-dot" />
          <span className="fleet-dot" />
          <span className="fleet-head-label">decdn · fleet · test</span>
        </div>

        <div className="fleet-body">
          <div className="fleet-summary">
            <span className="fleet-value">
              {active}
              <span className="fleet-dim"> / {NODES.length}</span>
            </span>
            <span className="fleet-dim">nodes serving</span>
          </div>

          {NODES.map((n, i) => (
            <div key={n.id} className="fleet-row">
              <span className="fleet-code">{n.id}</span>
              <span
                className={
                  n.active
                    ? `fleet-pulse fleet-pulse-active pulse-${i % 6}`
                    : "fleet-pulse"
                }
              />
              <span
                className={n.active ? "fleet-rate" : "fleet-rate fleet-dim"}
              >
                {n.rate}
              </span>
            </div>
          ))}

          <div className="fleet-divider" />

          <div className="fleet-agg">
            <span className="fleet-dim">Σ throughput</span>
            <span className="fleet-value">15.1 GB/s</span>
          </div>
          <div className="fleet-bar">
            <span className="fleet-bar-fill fb-throughput" />
          </div>

          <div className="fleet-agg">
            <span className="fleet-dim">Σ revenue</span>
            <span className="fleet-value">$0.151 /s</span>
          </div>
          <div className="fleet-bar">
            <span className="fleet-bar-fill fb-revenue" />
          </div>
        </div>
      </div>
    </div>
  );
}
