import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { links, SITE_URL, INDEXABLE } from "@/lib/links";
import { Chrome } from "@/components/site/Chrome";
import { Footer } from "@/components/site/Footer";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { FAQ_ITEMS } from "@/lib/faq";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TITLE = "deCDN — A peer-to-peer delivery layer for bytes at scale";
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
  alternates: { canonical: "/" },
  robots: { index: INDEXABLE, follow: INDEXABLE },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#000000",
};

const ORG_ID = `${SITE_URL}#organization`;
const SITE_ID = `${SITE_URL}#website`;
const SERVICE_ID = `${SITE_URL}#service`;
const FAQ_ID = `${SITE_URL}#faq`;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "deCDN",
  url: SITE_URL,
  logo: `${SITE_URL}d_logo.png`,
  description:
    "Organization developing deCDN, a peer-to-peer content delivery network with per-megabyte settlement in USDC.",
  sameAs: [links.github, links.x],
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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": FAQ_ID,
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Inline JSON in <script> must escape `<` so a stray `</script>` in any field
// can't close the tag and create an XSS sink. < decodes back to `<` in
// every JSON parser, so structured-data consumers are unaffected.
const safeJSONLD = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

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
        {[organizationSchema, websiteSchema, serviceSchema, faqSchema].map(
          (schema) => (
            <script
              key={schema["@id"]}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: safeJSONLD(schema) }}
            />
          ),
        )}
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
