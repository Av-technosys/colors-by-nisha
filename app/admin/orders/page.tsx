import type { Metadata } from "next";
import { RecordsPage } from "@/components/admin/RecordsPage";
import { orderPage } from "@/data/admin";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return <RecordsPage data={orderPage} />;
}
