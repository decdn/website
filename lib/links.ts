// TODO: replace placeholder `site` URL before launch.
// When swapped to real origin, flip `robots` to `index: true` in app/layout.tsx.
// `litepaper` is wired same-origin; the PDF is intentionally not in public/ yet,
// so the link 404s until the PDF is published.
export const links = {
  site: "https://decdn.example",
  github: "https://github.com/decdn",
  litepaper: "/litepaper-v0.pdf",
  docs: "https://docs.decdn.org/overview/introduction",
  runNode: "https://docs.decdn.org/node-operators/overview",
  contact: "mailto:info@decdn.org",
} as const;

export type LinkKey = keyof typeof links;
