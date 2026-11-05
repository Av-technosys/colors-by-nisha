import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";
import { RecordsPage } from "@/components/admin/RecordsPage";
import { contactPage, type AdminRecord } from "@/data/admin";
import { db } from "@/lib/db";
import { contactUs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Contact" };

async function ContactContent() {
  let dbRecords: AdminRecord[] = [];
  try {
    const rows = await db
      .select()
      .from(contactUs)
      .orderBy(desc(contactUs.createdAt));

    if (rows && rows.length > 0) {
      dbRecords = rows.map((row) => ({
        id: `INQ-${row.id.slice(0, 6).toUpperCase()}`,
        title: row.name || "Anonymous",
        subtitle: row.email || "No email",
        status: "New",
        detail: `${row.phone ? `Phone: ${row.phone}\n\n` : ""}Message:\n${row.message || "No message content"}`,
        fields: {
          Subject: row.phone ? `Phone: ${row.phone}` : "General Enquiry",
          Received: row.createdAt
            ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(row.createdAt))
            : "Today",
        },
      }));
    }
  } catch (error) {
    console.error("Failed to load contact submissions from DB:", error);
  }

  const pageData = {
    ...contactPage,
    records: dbRecords.length > 0 ? dbRecords : contactPage.records,
  };

  return <RecordsPage data={pageData} />;
}

export default function ContactPage() { return <Suspense fallback={<TableSkeleton />}><ContactContent /></Suspense>; }
