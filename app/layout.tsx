import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { links, SITE_URL, INDEXABLE, ORG_ID, X_HANDLE } from "@/lib/links";
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

const TITLE = "deCDN — A peer-to-peer delivery layer for bytes at scale";
const DESCRIPTION =
  "A peer-to-peer CDN. Anyone can serve bytes; clients pay per megabyte in USDC. ~$0.01/GB — up to 90% cheaper than traditional networks.";

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
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    site: X_HANDLE,
    creator: X_HANDLE,
  },
  alternates: { canonical: "/" },
  robots: { index: INDEXABLE, follow: INDEXABLE },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#000000",
};

const SITE_ID = `${SITE_URL}#website`;
const SERVICE_ID = `${SITE_URL}#service`;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "deCDN",
  url: SITE_URL,
  logo: `${SITE_URL}d_logo.png`,
  description:
    "Organization developing deCDN, a peer-to-peer content delivery network with per-megabyte settlement in USDC.",
  sameAs: [links.github, links.x, links.linkedin],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: "deCDN",
  description: DESCRIPTION,
  publisher: { "@id": ORG_ID },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": SERVICE_ID,
  name: "deCDN",
  url: SITE_URL,
  serviceType: "Content Delivery Network",
  provider: { "@id": ORG_ID },
  areaServed: "Worldwide",
  description: DESCRIPTION,
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
        {[organizationSchema, websiteSchema, serviceSchema].map((schema) => (
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
