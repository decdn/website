import type { Metadata } from "next";
import { LegalDoc } from "@/components/ui/LegalDoc";
import { legalMetadata } from "@/lib/legal";

export const metadata: Metadata = legalMetadata("privacy");

export default function PrivacyPage() {
  return <LegalDoc slug="privacy" />;
}
