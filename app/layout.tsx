import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { links } from "@/lib/links";
import { Chrome } from "@/components/site/Chrome";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TITLE = "deCDN — The delivery layer for open information";
const DESCRIPTION =
  "A peer-to-peer CDN. Anyone can serve bytes; clients pay per megabyte in USDC. ~$0.01/GB — up to 90% cheaper than legacy networks.";

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
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full motion-safe:scroll-smooth`}
    >
      <body className="min-h-full">
        <Chrome />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
