// Why both `pathname === "/"` and `scrolled` must hold for `observed` to win:
// - Off-home, the caller's section observer holds stale values from the
//   previous home-route render — off-home reads must dominate.
// - On home, `scrolled` doubles as a "past the intro hero" proxy that
//   suppresses the brief window after a client-side back-nav resets scroll
//   to top while the observer's last value is still in flight.
export function resolveActiveSection<T extends string>(
  pathname: string,
  scrolled: boolean,
  observed: T,
  fallback: T,
): T {
  return pathname === "/" && scrolled ? observed : fallback;
}
