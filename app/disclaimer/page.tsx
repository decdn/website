import type { Metadata } from "next";
import { LegalDoc } from "@/components/ui/LegalDoc";
import { legalMetadata } from "@/lib/legal";

export const metadata: Metadata = legalMetadata("disclaimer");

export default function DisclaimerPage() {
  return <LegalDoc slug="disclaimer" />;
}
