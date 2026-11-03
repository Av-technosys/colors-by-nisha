import type { Metadata } from "next";
import { RecordsPage } from "@/components/admin/RecordsPage";
import { userPage } from "@/data/admin";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return <RecordsPage data={userPage} />;
}
