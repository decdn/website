import type { Metadata, ResolvingMetadata } from "next";
import { NetworkExplainer } from "@/components/network/NetworkExplainer";
import { JsonLd } from "@/lib/jsonld";
import { links, NETWORK_URL } from "@/lib/links";
import {
  imagesField,
  inheritedOgImages,
  OG_SITE,
  TWITTER_SITE,
} from "@/lib/metadata";
import { NETWORK_DESCRIPTION, NETWORK_TITLE } from "@/lib/network";
import { breadcrumbNode, HOME_CRUMB } from "@/lib/schema";

// Defining `openGraph` replaces the parent's resolved object wholesale, so the
// root `app/opengraph-image.png` is threaded through (see lib/metadata.ts).
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const images = await inheritedOgImages(parent);
  return {
    title: NETWORK_TITLE,
    description: NETWORK_DESCRIPTION,
    alternates: { canonical: links.network },
    openGraph: {
      ...OG_SITE,
      title: NETWORK_TITLE,
      description: NETWORK_DESCRIPTION,
      url: links.network,
      type: "website",
      ...imagesField(images),
    },
    twitter: {
      ...TWITTER_SITE,
      card: "summary_large_image",
      title: NETWORK_TITLE,
      description: NETWORK_DESCRIPTION,
    },
  };
}

export default function NetworkPage() {
  return (
    <main>
      <JsonLd
        data={breadcrumbNode(`${NETWORK_URL}#breadcrumbs`, [
          HOME_CRUMB,
          { name: NETWORK_TITLE, item: NETWORK_URL },
        ])}
      />
      <NetworkExplainer />
    </main>
  );
}
