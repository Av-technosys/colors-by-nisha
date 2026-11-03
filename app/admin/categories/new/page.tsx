import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Add category" };

export default function NewCategoryPage() {
  return <CategoryForm />;
}
