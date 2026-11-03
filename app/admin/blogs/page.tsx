import type { Metadata } from "next";
import { CatalogTable } from "@/components/admin/CatalogTable";
import { deleteBlog, loadBlogs } from "./actions";

export const metadata: Metadata = { title: "Blogs" };

export default function BlogsPage() {
  return (
    <CatalogTable
      title="Blogs"
      singular="blog"
      description="Create and manage stories from Colors by Nisha."
      basePath="/admin/blogs"
      columns={["Category", "Author", "Publish date"]}
      statuses={["draft", "published"]}
      showCategoryFilter
      loadAction={loadBlogs}
      deleteAction={deleteBlog}
    />
  );
}
