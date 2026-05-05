import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { links, SITE_URL } from "@/lib/links";
import { Chrome } from "@/components/site/Chrome";
import { ScrollReveal } from "@/components/site/ScrollReveal";
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
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#000000",
};

const ORG_ID = `${SITE_URL}#organization`;
const SITE_ID = `${SITE_URL}#website`;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "deCDN",
  url: SITE_URL,
  logo: `${SITE_URL}icon.svg`,
  description: DESCRIPTION,
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
      <body className="min-h-full">
        {[organizationSchema, websiteSchema].map((schema) => (
          <script
            key={schema["@id"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJSONLD(schema) }}
          />
        ))}
        <Chrome />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
