import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { links, INDEXABLE, SITE_URL } from "@/lib/links";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/lib/copy";
import { organizationNode, serviceNode, websiteNode } from "@/lib/schema";
import { OG_SITE, TWITTER_SITE } from "@/lib/metadata";
import { Chrome } from "@/components/site/Chrome";
import { Footer } from "@/components/site/Footer";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { JsonLd } from "@/lib/jsonld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(links.site),
  title: {
    default: SITE_TITLE,
    template: "%s · deCDN",
  },
  description: SITE_DESCRIPTION,
  applicationName: "deCDN",
  openGraph: {
    ...OG_SITE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
  },
  twitter: {
    ...TWITTER_SITE,
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: "/",
    // Renders <link rel="alternate" type="text/plain" href=".../llms.txt">.
    // It sits in the root layout so the site-level index is discoverable from
    // the homepage. Routes that set their own `alternates` (app/blog/page.tsx,
    // app/blog/[slug]/page.tsx, lib/legal.ts) replace the parent's wholesale
    // under Next's shallow merge, exactly as they do for `openGraph` — that is
    // accepted rather than threaded through every route.
    types: { "text/plain": `${SITE_URL}llms.txt` },
  },
  robots: { index: INDEXABLE, follow: INDEXABLE },
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
      <head>
        {[organizationNode, websiteNode, serviceNode].map((schema) => (
          <JsonLd key={schema["@id"]} data={schema} />
        ))}
      </head>
      <body className="min-h-full">
        <Chrome />
        <ScrollReveal />
        {children}
        <Footer />
      </body>
    </html>
  );
}
