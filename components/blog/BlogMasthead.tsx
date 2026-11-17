import type { ReactNode } from "react";
import { Frame } from "@/components/ui/Frame";

/**
 * The dark band that opens every blog page, with the green glow rising from
 * its bottom-right corner (`.blog-masthead` in globals.css). The extra top
 * padding clears the fixed nav, which turns ink-toned over the band.
 */
export function BlogMasthead({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <Frame
      id={id}
      tone="ink"
      navDark
      className="blog-masthead pt-[calc(var(--spacing-frame-pad-y)+3rem)]"
    >
      {children}
    </Frame>
  );
}
