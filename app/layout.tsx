import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import { links } from "@/lib/links";
import "./globals.css";

const display = VT323({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "deCDN — A decentralized CDN paid per megabyte";
const DESCRIPTION =
  "Stake-secured P2P nodes serve BLAKE3-addressed content over QUIC. Clients pay per MB in USDC through off-chain channels. No hyperscaler required.";

export const metadata: Metadata = {
  metadataBase: new URL(links.site),
  title: {
    default: TITLE,
    template: "%s · deCDN",
  },
  description: DESCRIPTION,
  applicationName: "deCDN",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "deCDN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  // Keep noindex while links.site is the placeholder origin.
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07120d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} h-full motion-safe:scroll-smooth antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
