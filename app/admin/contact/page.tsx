import type { Metadata } from "next";
import { RecordsPage } from "@/components/admin/RecordsPage";
import { contactPage } from "@/data/admin";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <RecordsPage data={contactPage} />;
}
