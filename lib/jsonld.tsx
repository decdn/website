// Inline JSON-LD helper used by every route that emits structured data.
// The `<` escape prevents a stray `</script>` in any JSON field from
// closing the inline tag and creating an XSS sink. `<` decodes back
// to `<` in every JSON parser, so structured-data consumers are
// unaffected.
const safeJSONLD = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

type Schema = { "@id"?: string } & Record<string, unknown>;

export function JsonLd({ data }: { data: Schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJSONLD(data) }}
    />
  );
}
