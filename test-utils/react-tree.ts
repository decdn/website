import { isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Walking the element tree a server component returns, without a renderer.
 *
 * vitest only collects `**\/*.test.ts` — a `.test.tsx` is silently skipped —
 * so component tests can't contain JSX. What they can do is call the component
 * as the plain function it is and inspect the tree it returns. These helpers
 * expand nested function components on the way down, so a section's markup can
 * be asserted through the primitives it composes.
 *
 * Test-only. Nothing under app/ or components/ imports from here.
 */

type AnyElement = ReactElement<{ children?: ReactNode }>;

const isElement = (node: unknown): node is AnyElement => isValidElement(node);

export function asElement(node: unknown): AnyElement {
  if (!isElement(node)) {
    throw new Error(`expected a React element, got ${typeof node}`);
  }
  return node;
}

/** Call a function component so its own subtree can be walked; host elements
 *  (`"div"`, `"tr"`, …) and fragments come back untouched. */
function expand(el: AnyElement): ReactNode {
  if (typeof el.type !== "function") return el;
  const render = el.type as (props: unknown) => ReactNode;
  return render(el.props);
}

const toArray = (node: ReactNode): ReactNode[] =>
  Array.isArray(node) ? node.flat(Infinity) : [node];

/** Direct element children, with text, `null` and `false` dropped. */
export function childElements(node: unknown): AnyElement[] {
  return toArray(asElement(node).props.children).filter(isElement);
}

/** Every string in the subtree, concatenated in document order. */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (!isElement(node)) return "";
  const expanded = expand(node);
  return expanded === node ? textOf(node.props.children) : textOf(expanded);
}

/** Every host element with this tag anywhere in the subtree, outermost first. */
export function findAll(node: ReactNode, tag: string): AnyElement[] {
  if (Array.isArray(node)) return node.flatMap((n) => findAll(n, tag));
  if (!isElement(node)) return [];
  const expanded = expand(node);
  if (expanded !== node) return findAll(expanded, tag);
  const here = node.type === tag ? [node] : [];
  return [...here, ...findAll(node.props.children, tag)];
}

/** The single host element with this tag; throws unless there is exactly one. */
export function findOne(node: ReactNode, tag: string): AnyElement {
  const found = findAll(node, tag);
  if (found.length !== 1) {
    throw new Error(`expected exactly one <${tag}>, found ${found.length}`);
  }
  return found[0];
}

export const hasTag = (node: ReactNode, tag: string): boolean =>
  findAll(node, tag).length > 0;

/** Props as a plain record, for reading attributes the JSX types don't model. */
export const attrs = (el: AnyElement): Record<string, unknown> =>
  el.props as Record<string, unknown>;
