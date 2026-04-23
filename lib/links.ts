// TODO: replace remaining placeholder URLs before launch.
// When `site` and `litepaper` are swapped to real origins,
// flip `robots` to `index: true` in app/layout.tsx.
export const links = {
  site: "https://decdn.example",
  github: "https://github.com/decdn",
  litepaper: "https://decdn.example/litepaper.pdf",
  docs: "https://docs.decdn.org/overview/introduction",
  runNode: "https://docs.decdn.org/node-operators/overview",
  contact: "mailto:info@decdn.org",
} as const;

export type LinkKey = keyof typeof links;
