export function resolveActiveSection<T>(
  pathname: string,
  scrolled: boolean,
  observed: T,
  fallback: T,
): T {
  return pathname === "/" && scrolled ? observed : fallback;
}
