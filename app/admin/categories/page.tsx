import type { Metadata } from "next";
import { CatalogTable } from "@/components/admin/CatalogTable";
import { deleteCategory, loadCategories } from "./actions";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <CatalogTable
      title="Categories"
      singular="category"
      description="Organise products into categories with unique URL slugs."
      basePath="/admin/categories"
      columns={["Products", "Blogs"]}
      loadAction={loadCategories}
      deleteAction={deleteCategory}
    />
  );
}
