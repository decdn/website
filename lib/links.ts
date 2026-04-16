// TODO: replace all placeholder URLs before launch.
export const links = {
  github: "https://github.com/REPLACE_ME/decdn",
  whitepaper: "https://decdn.example/whitepaper.pdf",
  docs: "https://decdn.example/docs",
  runNode: "https://decdn.example/docs/run-a-node",
  contact: "mailto:hello@decdn.example",
} as const;

export type LinkKey = keyof typeof links;
