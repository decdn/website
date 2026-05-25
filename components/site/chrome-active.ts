// Both `pathname === "/"` and `scrolled` must hold for `observed` to win.
// Off-home, the caller's observer never gets built but `active` still
// holds its last home-route value — the home check stops that stale value
// painting. On home, `active` is briefly stale between the route-change
// render and the new observer's first callback; `scrolled` (scrollY > 8)
// stands in for "observer has had a moment to fire". Caveat: back-nav
// with restored scroll skips this — a brief stale-tone flash is possible.
export function resolveActiveSection<T>(
  pathname: string,
  scrolled: boolean,
  observed: T,
  fallback: T,
): T {
  return pathname === "/" && scrolled ? observed : fallback;
}
