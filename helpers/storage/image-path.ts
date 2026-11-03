export function imageKeyPrefix(folder: "products" | "blogs") {
  const prefix = (process.env.AWS_S3_PREFIX ?? "").replace(/^\/+|\/+$/g, "");
  return `${prefix ? `${prefix}/` : ""}uploads/${folder}/`;
}
