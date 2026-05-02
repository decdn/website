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
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#000000",
};

const SITE_URL = new URL("/", links.site).toString();
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
  sameAs: [links.github],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Chrome />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
