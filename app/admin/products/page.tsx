import type { Metadata } from "next";
import { CatalogTable } from "@/components/admin/CatalogTable";
import { deleteProduct, loadProducts } from "./actions";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <CatalogTable
      title="Products"
      singular="product"
      description="Manage your collection, product details, and variants."
      basePath="/admin/products"
      columns={["SKU", "Category", "Price"]}
      statuses={["draft", "active", "archived"]}
      loadAction={loadProducts}
      deleteAction={deleteProduct}
    />
  );
}
