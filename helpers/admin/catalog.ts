import "server-only";

export type CatalogRow = {
  id: string;
  name: string;
  slug: string;
  fields: Record<string, string>;
  status?: string;
  categoryId?: string;
};

export type CatalogData = {
  records: CatalogRow[];
  categories?: { id: string; name: string }[];
  error?: string;
};

const connectionErrors = ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN", "ENOTFOUND", "57P01", "57P02", "57P03", "08000", "08003", "08006"];

function errorCode(error: unknown) {
  const details = error as { code?: string; cause?: { code?: string } };
  return details?.cause?.code ?? details?.code ?? "";
}

export async function readCatalog(read: () => Promise<CatalogData>): Promise<CatalogData> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await read();
    } catch (error) {
      const code = errorCode(error);
      const cause = (error as { cause?: unknown })?.cause ?? error;
      const disconnected = cause instanceof Error && /timeout|connection terminated|socket hang up|connection error/i.test(cause.message);
      if (attempt === 0 && (connectionErrors.includes(code) || disconnected)) continue;
      console.error("Admin table data could not be loaded:", code || "unknown error");
      if (["42P01", "42703"].includes(code)) {
        return { records: [], error: "The database schema needs updating. Apply the latest migration, then retry." };
      }
      return { records: [], error: "The records could not be loaded. Please try again." };
    }
  }
  return { records: [], error: "The records could not be loaded. Please try again." };
}
