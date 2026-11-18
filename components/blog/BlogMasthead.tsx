import type { ReactNode } from "react";
import { Frame } from "@/components/ui/Frame";

/**
 * The dark band that opens every blog page. The extra top padding clears the
 * fixed nav, which turns ink-toned over the band.
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
      className="pt-[calc(var(--spacing-frame-pad-y)+3rem)]"
    >
      {children}
    </Frame>
  );
}
