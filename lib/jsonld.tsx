type Schema = {
  "@context": string;
  "@type": string;
  "@id": string;
} & Record<string, unknown>;

// Escape `<` as the JSON unicode escape `<` so a stray `</script>` in
// any field can't close the inline tag (XSS). Transparent to structured-data
// consumers — every JSON parser decodes the escape back to `<`.
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
