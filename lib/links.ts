// TODO: replace remaining placeholder URLs before launch.
// When `site`, `whitepaper`, and `runNode` are swapped to real origins,
// flip `robots` to `index: true` in app/layout.tsx.
export const links = {
  site: "https://decdn.example",
  github: "https://github.com/decdn",
  whitepaper: "https://decdn.example/whitepaper.pdf",
  docs: "https://docs.decdn.org/overview/introduction",
  runNode: "https://decdn.example/docs/run-a-node",
  contact: "mailto:info@decdn.org",
} as const;

export type LinkKey = keyof typeof links;
