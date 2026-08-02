/**
 * A top-level JSON-LD node.
 *
 * `@context` is pinned to the literal and `@type` is a type parameter, so a
 * node annotated `Schema<"Organization">` rejects a misspelled `@type` at
 * compile time — the failure mode this type otherwise can't see, since the
 * `Record<string, unknown>` tail switches off excess-property checking and
 * makes every other key (and every nested node under it) unchecked.
 *
 * That tail is the reason lib/schema.test.ts pins whole nodes with `toEqual`
 * rather than trusting the compiler: today `offers.priceSpecification` could
 * lose a field without a type error. Adding `schema-dts` would close the rest
 * of the gap at the cost of a devDependency.
 */
export type Schema<T extends string = string> = {
  "@context": "https://schema.org";
  "@type": T;
  "@id": string;
} & Record<string, unknown>;

// Escape every `<` as its JSON unicode escape (backslash-u003c) so a stray
// `</script>` in any field can't close the inline tag (XSS). Transparent to
// structured-data consumers — every JSON parser decodes the escape back to `<`.
// Spelled out in prose because writing the escape literally in this comment
// would render it as a bare `<` and say nothing.
const safeJSONLD = (data: Schema) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export function JsonLd({ data }: { data: Schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJSONLD(data) }}
    />
  );
}
