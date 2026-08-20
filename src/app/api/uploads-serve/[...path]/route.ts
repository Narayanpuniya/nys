import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// MIME types for uploaded files
const MIME: Record<string, string> = {
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
  gif:  "image/gif",
  pdf:  "application/pdf",
};

/**
 * Hostinger versioned build path:
 *   cwd = /home/user/domains/nys.org.in/hbuilds/versions/{HASH}/nodejs
 * Persistent uploads (4 levels up):
 *   /home/user/domains/nys.org.in/uploads/
 */
function getUploadCandidates(safe: string[]): string[] {
  const cwd = process.cwd();

  if (cwd.includes("/hbuilds/versions/")) {
    // Hostinger: persistent path, doesn't change with deployments
    const persistent = path.resolve(cwd, "../../../../uploads");
    return [
      path.join(persistent, ...safe),
      path.join(cwd, "public", "uploads", ...safe), // fallback: versioned public
    ];
  }

  // Local dev / other hosts
  return [
    path.join(cwd, "public", "uploads", ...safe),
    path.join(cwd, "..", "public", "uploads", ...safe),
    path.join(cwd, "..", "..", "public", "uploads", ...safe),
  ];
}

/**
 * Serves uploaded files from disk.
 * Next.js standalone mode does not auto-serve public/ — this route handles it.
 * Rewrite in next.config.mjs: /uploads/:path* → /api/_uploads/:path*
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Security: block path traversal
  const safe = (segments || []).map((s) =>
    s.replace(/\.\./g, "").replace(/[<>:"|?*]/g, ""),
  );
  if (safe.some((s) => !s)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const candidates = getUploadCandidates(safe);

  for (const filePath of candidates) {
    try {
      await stat(filePath);
      const buf = await readFile(filePath);
      const ext = (safe[safe.length - 1].split(".").pop() ?? "").toLowerCase();
      const contentType = MIME[ext] ?? "application/octet-stream";
      return new NextResponse(buf, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    } catch {
      // try next candidate
    }
  }

  return NextResponse.json({ error: "File not found", tried: candidates }, { status: 404 });
}
