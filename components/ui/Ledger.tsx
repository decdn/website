export function Ledger({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-t border-current/20 pt-2">
      <span className="meta opacity-60">{k}</span>
      <span className="tabular-nums">{v}</span>
    </li>
  );
}
