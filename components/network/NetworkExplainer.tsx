"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { highlightBrand } from "@/components/brand";
import {
  CLIENT_TILES,
  DATA_NOTE,
  DATA_TILES,
  GOVERNANCE_RAIL,
  LAYERS,
  NETWORK_HEADLINE,
  NETWORK_LEGEND,
  NETWORK_TILES,
  PAYMENT_RAIL,
  ROLES,
  TOPICS,
  TOUR_HINT,
  TOUR_IDS,
  TOURS,
  isTopicId,
  type Hue,
  type Layer,
  type Rail,
  type Tile,
  type TopicId,
  type TourId,
} from "@/lib/network";

type Highlight = {
  open: TopicId | null;
  lit: ReadonlySet<TopicId> | null;
  onOpen: (id: TopicId) => void;
};

const LEGEND: readonly { hue: Hue; label: string }[] = [
  { hue: "clients", label: "Clients" },
  { hue: "net", label: "Delivery" },
  { hue: "data", label: "Data" },
  { hue: "gov", label: "Governance" },
  { hue: "pay", label: "Payment" },
];

function stateClass(topic: TopicId, h: Highlight): string {
  if (h.open === topic) return " is-open";
  if (h.lit === null) return "";
  return h.lit.has(topic) ? " is-lit" : " is-dim";
}

function TileButton({ tile, h }: { tile: Tile; h: Highlight }) {
  const span = tile.span ? ` nx-span${tile.span}` : "";
  const strip = tile.strip ? " nx-strip" : "";
  return (
    <button
      type="button"
      className={`nx-tile${span}${strip}${stateClass(tile.topic, h)}`}
      onClick={() => h.onOpen(tile.topic)}
    >
      <span className="nx-tile-k">{tile.label}</span>
      <span className="nx-tile-d">{tile.detail}</span>
      {tile.tag ? <span className="nx-tile-tag">{tile.tag}</span> : null}
    </button>
  );
}

function Head({
  topic,
  eyebrow,
  title,
  desc,
  h,
}: {
  topic: TopicId;
  eyebrow: string;
  title: string;
  desc: string;
  h: Highlight;
}) {
  return (
    <button
      type="button"
      className={`nx-head${stateClass(topic, h)}`}
      onClick={() => h.onOpen(topic)}
    >
      <span className="nx-eyebrow">{eyebrow}</span>
      <span className="nx-head-title">{title}</span>
      <span className="nx-head-desc">{desc}</span>
    </button>
  );
}

function RailColumn({ rail, hue, h }: { rail: Rail; hue: Hue; h: Highlight }) {
  return (
    <aside
      className={`nx-rail nx-hue-${hue}`}
      aria-label={TOPICS[rail.topic].title}
    >
      <Head
        topic={rail.topic}
        eyebrow={rail.eyebrow}
        title={rail.title}
        desc={rail.desc}
        h={h}
      />
      <div className="nx-rail-items">
        {rail.tiles.map((tile) => (
          <TileButton key={tile.topic} tile={tile} h={h} />
        ))}
      </div>
      <div className="nx-rail-foot">{rail.foot}</div>
    </aside>
  );
}

function LayerBand({
  layer,
  h,
  children,
}: {
  layer: Layer;
  h: Highlight;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`nx-layer nx-hue-${layer.hue}`}
      aria-label={TOPICS[layer.topic].title}
    >
      <Head
        topic={layer.topic}
        eyebrow={layer.eyebrow}
        title={layer.title}
        desc={layer.desc}
        h={h}
      />
      <div className="nx-grid4">{children}</div>
    </section>
  );
}

function Links({ items }: { items: readonly [string, string][] }) {
  return (
    <div className="nx-links" aria-hidden>
      {items.map(([cls, label]) => (
        <div key={cls} className={`nx-conn ${cls}`}>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Drawer({
  id,
  onClose,
  onOpen,
  closeRef,
}: {
  id: TopicId | null;
  onClose: () => void;
  onOpen: (id: TopicId) => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const topic = id === null ? null : TOPICS[id];
  return (
    <>
      <div
        className="nx-scrim"
        data-open={id !== null ? "true" : undefined}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`nx-drawer nx-hue-${topic?.hue ?? "brand"}`}
        data-open={id !== null ? "true" : undefined}
        role="dialog"
        aria-modal="false"
        aria-labelledby={topic ? "nx-drawer-title" : undefined}
        aria-hidden={id === null}
        inert={id === null}
      >
        <div className="nx-drawer-top">
          <span className="nx-eyebrow">{topic?.eyebrow}</span>
          <button
            ref={closeRef}
            type="button"
            className="nx-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {topic ? (
          <div className="nx-drawer-body">
            <h2 id="nx-drawer-title">{topic.title}</h2>
            <p className="nx-sum">{topic.summary}</p>
            {topic.body.map((p) => (
              <p key={p} className="nx-p">
                {p}
              </p>
            ))}
            {id === "roles" ? (
              <ul className="nx-roles">
                {ROLES.map((r) => (
                  <li key={r.name}>
                    <b>{r.name}</b>
                    <span>{r.does}</span>
                    <em>uses {r.uses}</em>
                  </li>
                ))}
              </ul>
            ) : null}
            {topic.facts.length > 0 ? (
              <dl className="nx-facts">
                {topic.facts.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="nx-eyebrow nx-muted">Related</div>
            <div className="nx-rel">
              {topic.related.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`nx-chip nx-hue-${TOPICS[r].hue}`}
                  onClick={() => onOpen(r)}
                >
                  <i aria-hidden />
                  {TOPICS[r].title}
                </button>
              ))}
            </div>
            <div className="nx-src">Source: {topic.source}</div>
          </div>
        ) : null}
      </aside>
    </>
  );
}

export function NetworkExplainer() {
  const [open, setOpen] = useState<TopicId | null>(null);
  const [tour, setTour] = useState<{ id: TourId; step: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const onOpen = useCallback((id: TopicId) => {
    setOpen((prev) => {
      if (prev === null && document.activeElement instanceof HTMLElement) {
        returnFocus.current = document.activeElement;
      }
      return id;
    });
    if (window.location.hash !== `#${id}`) {
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  const onClose = useCallback(() => {
    setOpen(null);
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    returnFocus.current?.focus({ preventScroll: true });
    returnFocus.current = null;
  }, []);

  // A shared link like /network/#origin opens that topic on arrival.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (isTopicId(id)) setOpen(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const current = tour === null ? null : TOURS[tour.id];
  const step =
    tour === null || current === null ? null : current.steps[tour.step];
  const h: Highlight = {
    open,
    lit: step ? new Set(step.topics) : null,
    onOpen,
  };
  const last = current ? current.steps.length - 1 : 0;

  return (
    <div className="nx">
      <div className="nx-top">
        <h1>{highlightBrand(NETWORK_HEADLINE)}</h1>
        <button
          type="button"
          className="nx-btn"
          onClick={() => onOpen("roles")}
        >
          Who takes part
        </button>
      </div>

      <div className="nx-tour">
        {tour === null || current === null || step === null ? (
          <>
            <span className="nx-tour-hint">{TOUR_HINT}</span>
            <div className="nx-tour-picks">
              {TOUR_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="nx-btn nx-primary"
                  onClick={() => setTour({ id, step: 0 })}
                >
                  {TOURS[id].button}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="nx-tour-body" aria-live="polite">
            <span className="nx-tour-name">{current.name}</span>
            <span className="nx-tour-count">
              {tour.step + 1} / {current.steps.length}
            </span>
            <p className="nx-tour-text">{step.text}</p>
            <div className="nx-tour-nav">
              <button
                type="button"
                className="nx-btn"
                disabled={tour.step === 0}
                onClick={() => setTour({ ...tour, step: tour.step - 1 })}
              >
                Back
              </button>
              <button
                type="button"
                className="nx-btn nx-primary"
                onClick={() =>
                  setTour({
                    ...tour,
                    step: tour.step === last ? 0 : tour.step + 1,
                  })
                }
              >
                {tour.step === last ? "Start over" : "Next"}
              </button>
              <button
                type="button"
                className="nx-btn"
                onClick={() => setTour(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="nx-map">
        <RailColumn rail={GOVERNANCE_RAIL} hue="gov" h={h} />

        <div className="nx-stack">
          <LayerBand layer={LAYERS.clients} h={h}>
            <TileButton tile={CLIENT_TILES.sdk} h={h} />
            <div className="nx-span2 nx-http-pair">
              <TileButton tile={CLIENT_TILES.http} h={h} />
              <div className="nx-mini-link" aria-hidden>
                HTTP
              </div>
              <TileButton tile={CLIENT_TILES.gateway} h={h} />
            </div>
          </LayerBand>

          <Links
            items={[
              ["nx-c-l", "iroh"],
              ["nx-c-r", "iroh"],
            ]}
          />

          <LayerBand layer={LAYERS.network} h={h}>
            {NETWORK_TILES.map((tile, i) => (
              <TileButton key={`${tile.topic}-${i}`} tile={tile} h={h} />
            ))}
          </LayerBand>

          <Links
            items={[
              ["nx-c-o3", "origin read"],
              ["nx-c-o4", "origin read"],
            ]}
          />

          <LayerBand layer={LAYERS.data} h={h}>
            <p className="nx-span2 nx-note">{DATA_NOTE}</p>
            {DATA_TILES.map((tile) => (
              <TileButton key={tile.label} tile={tile} h={h} />
            ))}
          </LayerBand>
        </div>

        <RailColumn rail={PAYMENT_RAIL} hue="pay" h={h} />
      </div>

      <div className="nx-legend" aria-hidden>
        <span>{NETWORK_LEGEND}</span>
        {LEGEND.map((l) => (
          <span key={l.hue} className={`nx-hue-${l.hue}`}>
            <i />
            {l.label}
          </span>
        ))}
      </div>

      <Drawer id={open} onClose={onClose} onOpen={onOpen} closeRef={closeRef} />
    </div>
  );
}
