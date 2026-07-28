import {
  isValidElement,
  type JSX,
  type ReactElement,
  type ReactNode,
} from "react";

/**
 * Walking the element tree a server component returns, without a renderer.
 *
 * vitest only collects `**\/*.test.ts` — a `.test.tsx` is silently skipped —
 * so component tests can't contain JSX. What they can do is call the component
 * as the plain function it is and inspect the tree it returns.
 *
 * `textOf` and `findAll` expand nested function components on the way down, so
 * a section's markup can be asserted through the primitives it composes.
 * `childElements` deliberately does not: it returns the elements a caller
 * passed *in*, which is what a test wants when it is checking the direct
 * children of a route (see app/legal/jsonld.test.ts).
 *
 * Every way this walker can fail to find something throws. That is the whole
 * design constraint: a walker that quietly returns `[]` for a node kind it
 * doesn't understand turns every `expect(...).toHaveLength(0)` and every
 * `expect(hasTag(...)).toBe(false)` into a test that passes whether or not the
 * code is correct.
 *
 * Test-only. Nothing under app/ or components/ imports from here.
 */

type AnyElement = ReactElement<{ children?: ReactNode }>;

/** Host tag names, so a typo (`"captoin"`) is a compile error rather than a
 *  silently-absent match that makes a negative assertion vacuous. */
type Tag = keyof JSX.IntrinsicElements;

const isElement = (node: unknown): node is AnyElement => isValidElement(node);

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === "object" && value !== null && "then" in value;

/** A readable description of a node, for error messages — `typeof` alone
 *  reports "object" for `null`, arrays and Promises alike, which are exactly
 *  the cases worth telling apart. */
function describeNode(node: unknown): string {
  if (node === null) return "null";
  if (Array.isArray(node)) return "an array";
  if (isThenable(node)) return "a Promise";
  return typeof node;
}

export function asElement(node: unknown): AnyElement {
  if (!isElement(node)) {
    throw new Error(`expected a React element, got ${describeNode(node)}`);
  }
  return node;
}

/**
 * Call a function component so its own subtree can be walked.
 *
 * Host elements (`"div"`, `"tr"`, …) and the built-in symbol types (fragments,
 * `Suspense`) come back untouched — descending into their children is already
 * correct. Anything else throws rather than being treated as a host element:
 * `memo` and `forwardRef` element types are *objects*, so passing them through
 * would walk the children handed to the wrapper instead of what it renders,
 * and every assertion below that point would silently look at the wrong tree.
 */
function expand(el: AnyElement): ReactNode {
  const { type } = el;
  if (typeof type === "string" || typeof type === "symbol") return el;
  if (typeof type !== "function") {
    throw new Error(
      `cannot walk <${String((type as { displayName?: string })?.displayName ?? "unknown")}>: ` +
        "element types that are neither a host tag nor a plain function " +
        "(memo, forwardRef, lazy) are not supported — unwrap it in the test",
    );
  }
  const render = type as (props: unknown) => ReactNode;
  const out = render(el.props);
  if (isThenable(out)) {
    throw new Error(
      `<${render.name || "anonymous"}> is an async component — await it and walk the result`,
    );
  }
  return out;
}

const toArray = (node: ReactNode): ReactNode[] =>
  Array.isArray(node) ? node.flat(Infinity) : [node];

/** Direct element children — text, `null`, `false`, numbers and `undefined`
 *  dropped. Does not expand components; see the module comment. */
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
export function findAll(node: ReactNode, tag: Tag): AnyElement[] {
  if (Array.isArray(node)) return node.flatMap((n) => findAll(n, tag));
  if (!isElement(node)) return [];
  const expanded = expand(node);
  if (expanded !== node) return findAll(expanded, tag);
  const here = node.type === tag ? [node] : [];
  return [...here, ...findAll(node.props.children, tag)];
}

/** The single host element with this tag; throws unless there is exactly one. */
export function findOne(node: ReactNode, tag: Tag): AnyElement {
  const found = findAll(node, tag);
  if (found.length !== 1) {
    throw new Error(`expected exactly one <${tag}>, found ${found.length}`);
  }
  return found[0];
}

/** At least one host element with this tag; throws if there are none, so a
 *  caller iterating the result can't loop zero times and pass vacuously. */
export function findSome(node: ReactNode, tag: Tag): AnyElement[] {
  const found = findAll(node, tag);
  if (found.length === 0) {
    throw new Error(`expected at least one <${tag}>, found none`);
  }
  return found;
}

export const hasTag = (node: ReactNode, tag: Tag): boolean =>
  findAll(node, tag).length > 0;

/** Props as a plain record, for reading attributes the JSX types don't model. */
export const attrs = (el: AnyElement): Record<string, unknown> =>
  el.props as Record<string, unknown>;
