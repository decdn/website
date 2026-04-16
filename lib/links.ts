// TODO: replace all placeholder URLs before launch.
// When `site` is swapped to a real origin, flip `robots` to
// `index: true` in app/layout.tsx.
export const links = {
  site: "https://decdn.example",
  github: "https://github.com/REPLACE_ME/decdn",
  whitepaper: "https://decdn.example/whitepaper.pdf",
  docs: "https://decdn.example/docs",
  runNode: "https://decdn.example/docs/run-a-node",
  contact: "mailto:hello@decdn.example",
} as const;

export type LinkKey = keyof typeof links;
