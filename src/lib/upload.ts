import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const RECEIPT_TYPES = new Set([...IMAGE_TYPES, "application/pdf"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export type UploadCategory =
  | "members"
  | "logo"
  | "seals"
  | "signatures"
  | "gallery"
  | "docs"
  | "receipts";

/**
 * Save an uploaded image under public/uploads/{category}/ and return a public URL.
 * Returns null if no file was provided / empty.
 */
export async function saveUploadedImage(
  file: File | null | undefined,
  category: UploadCategory,
  opts: { maxBytes?: number; allowPdf?: boolean } = {},
): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;

  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024; // 2 MB
  if (file.size > maxBytes) {
    throw new Error(`फ़ाइल बहुत बड़ी है (अधिकतम ${Math.round(maxBytes / 1024 / 1024)} MB)।`);
  }
  const allowed = opts.allowPdf ? RECEIPT_TYPES : IMAGE_TYPES;
  if (!allowed.has(file.type)) {
    throw new Error(
      opts.allowPdf
        ? "केवल JPG, PNG, WEBP, GIF या PDF स्वीकार्य हैं।"
        : "केवल JPG, PNG, WEBP या GIF छवियाँ स्वीकार्य हैं।",
    );
  }

  const ext = EXT[file.type] ?? "bin";
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", category);
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${category}/${name}`;
}
