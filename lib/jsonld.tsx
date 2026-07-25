type Schema = {
  "@context": string;
  "@type": string;
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
