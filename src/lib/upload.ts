import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type UploadCategory =
  | "members"
  | "logo"
  | "seals"
  | "signatures"
  | "gallery"
  | "docs";

/**
 * Save an uploaded image under public/uploads/{category}/ and return a public URL.
 * Returns null if no file was provided / empty.
 */
export async function saveUploadedImage(
  file: File | null | undefined,
  category: UploadCategory,
  opts: { maxBytes?: number } = {},
): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;

  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024; // 2 MB
  if (file.size > maxBytes) {
    throw new Error(`फ़ाइल बहुत बड़ी है (अधिकतम ${Math.round(maxBytes / 1024 / 1024)} MB)।`);
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("केवल JPG, PNG, WEBP या GIF छवियाँ स्वीकार्य हैं।");
  }

  const ext = EXT[file.type] ?? "bin";
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", category);
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${category}/${name}`;
}
