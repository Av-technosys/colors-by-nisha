import type { Metadata } from "next";
import { RecordsPage } from "@/components/admin/RecordsPage";
import { paymentPage } from "@/data/admin";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  return <RecordsPage data={paymentPage} />;
}
