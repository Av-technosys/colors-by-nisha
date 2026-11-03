import type { Metadata } from "next";
import { productStatuses } from "@/helpers/admin/product-input";
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
      statuses={productStatuses}
      loadAction={loadProducts}
      deleteAction={deleteProduct}
    />
  );
}
