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
  | "slider"
  | "docs"
  | "receipts"
  | "finance";

function assertUploadable(
  file: File,
  opts: { maxBytes: number; allowPdf: boolean },
) {
  if (file.size > opts.maxBytes) {
    throw new Error(`फ़ाइल बहुत बड़ी है (अधिकतम ${Math.round(opts.maxBytes / 1024 / 1024)} MB)।`);
  }
  const type = file.type || "application/octet-stream";
  const allowed = opts.allowPdf ? RECEIPT_TYPES : IMAGE_TYPES;
  // कुछ मोबाइल browsers खाली mime भेजते हैं — extension से अनुमान
  const name = (file.name || "").toLowerCase();
  const byExt =
    name.endsWith(".jpg") || name.endsWith(".jpeg")
      ? "image/jpeg"
      : name.endsWith(".png")
        ? "image/png"
        : name.endsWith(".webp")
          ? "image/webp"
          : name.endsWith(".gif")
            ? "image/gif"
            : name.endsWith(".pdf")
              ? "application/pdf"
              : type;
  if (!allowed.has(byExt) && !allowed.has(type)) {
    throw new Error(
      opts.allowPdf
        ? "केवल JPG, PNG, WEBP, GIF या PDF स्वीकार्य हैं।"
        : "केवल JPG, PNG, WEBP या GIF छवियाँ स्वीकार्य हैं।",
    );
  }
  return byExt.startsWith("image/") || byExt === "application/pdf" ? byExt : type;
}

/**
 * Hostinger deploys to a versioned path:
 *   /home/user/domains/nys.org.in/hbuilds/versions/{HASH}/nodejs/
 * Going 4 levels up gives a PERSISTENT path across deployments:
 *   /home/user/domains/nys.org.in/uploads/
 */
function getUploadCandidates(category: UploadCategory): string[] {
  const cwd = process.cwd();

  // Hostinger versioned build detected → use persistent path 4 levels up
  if (cwd.includes("/hbuilds/versions/")) {
    const persistent = path.resolve(cwd, "../../../../uploads", category);
    return [persistent, path.join("/tmp", "nys-uploads", category)];
  }

  // Local dev / other hosts → public/uploads in project
  return [
    path.join(cwd, "public", "uploads", category),
    path.join(cwd, "..", "public", "uploads", category),
    path.join("/tmp", "nys-uploads", category),
  ];
}

async function tryWritePublicFile(
  buf: Buffer,
  category: UploadCategory,
  ext: string,
): Promise<string | null> {
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const candidates = getUploadCandidates(category);
  for (const dir of candidates) {
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), buf);
      // /tmp → URL नहीं बन सकती; बाकी सब → URL दें
      if (!dir.startsWith("/tmp")) {
        return `/uploads/${category}/${name}`;
      }
    } catch {
      // अगला path आज़माएँ
    }
  }
  return null;
}

/**
 * Save an uploaded image under public/uploads/{category}/ and return a public URL.
 * Returns null if no file was provided / empty.
 * Hostinger जैसे read-only FS पर null — caller data-URL fallback कर सकता है।
 */
export async function saveUploadedImage(
  file: File | null | undefined,
  category: UploadCategory,
  opts: { maxBytes?: number; allowPdf?: boolean } = {},
): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;

  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024;
  const allowPdf = opts.allowPdf ?? false;
  const mime = assertUploadable(file, { maxBytes, allowPdf });
  const ext = EXT[mime] ?? "bin";
  const buf = Buffer.from(await file.arrayBuffer());
  return tryWritePublicFile(buf, category, ext);
}

/**
 * भुगतान रसीद: Hostinger disk पर save करें।
 * Neon/database में base64 store नहीं होगी — सब Hostinger पर।
 */
export async function saveReceiptProof(
  file: File,
  opts: { maxBytes?: number } = {},
): Promise<string> {
  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024;
  const mime = assertUploadable(file, { maxBytes, allowPdf: true });
  const ext = EXT[mime] ?? "bin";
  const buf = Buffer.from(await file.arrayBuffer());

  const diskUrl = await tryWritePublicFile(buf, "receipts", ext);
  if (diskUrl) return diskUrl;

  // Disk write fail → error (Neon में base64 नहीं जाएगा)
  throw new Error("रसीद save नहीं हो सकी। Hostinger का uploads folder जाँचें।");
}
