// `litepaper` 404s until the PDF lands in public/ — see #26.
export const links = {
  site: "https://decdn.org",
  github: "https://github.com/decdn",
  x: "https://x.com/deCDNorg",
  litepaper: "/litepaper-v0.pdf",
  docs: "https://docs.decdn.org/overview/introduction",
  runNode: "https://docs.decdn.org/node-operators/overview",
  contact: "mailto:info@decdn.org",
} as const;

export type LinkKey = keyof typeof links;
