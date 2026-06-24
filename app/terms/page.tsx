import type { Metadata } from "next";
import { LegalDoc } from "@/components/ui/LegalDoc";
import { legalMetadata } from "@/lib/legal";

export const metadata: Metadata = legalMetadata("terms");

export default function TermsPage() {
  return <LegalDoc slug="terms" />;
}
