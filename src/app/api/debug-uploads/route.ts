import { NextResponse } from "next/server";
import { readdir, stat, mkdir, writeFile, copyFile } from "fs/promises";
import path from "path";

// 1x1 transparent PNG
const PNG_1x1 = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489" +
  "0000000a49444154789c6260000000020001e221bc330000000049454e44ae426082",
  "hex"
);

export async function GET(req: Request) {
  const cwd = process.cwd();
  const url = new URL(req.url);

  // Derived paths
  const domainRoot = cwd.includes("/hbuilds/versions/")
    ? path.resolve(cwd, "../../../../")
    : cwd;

  const persistentUploads = path.join(domainRoot, "uploads");
  const pubHtmlUploads = path.join(domainRoot, "public_html", "uploads");
  const versionedUploads = path.join(cwd, "public", "uploads");

  if (url.searchParams.get("migrate") === "1") {
    return handleMigrate(cwd, persistentUploads);
  }

  // Write test image to every candidate and report
  const testFile = "gallery/_location_test.png";
  const tests: Record<string, unknown> = {};

  for (const [label, base] of [
    ["persistent (/uploads/)", persistentUploads],
    ["public_html (/public_html/uploads/)", pubHtmlUploads],
    ["versioned (current build)", versionedUploads],
  ] as [string, string][]) {
    const dir = path.join(base, "gallery");
    const fpath = path.join(base, testFile);
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(fpath, PNG_1x1);
      // Count real images
      const files = (await readdir(base, { recursive: true }).catch(() => [])) as string[];
      const imgs = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f) && !f.includes("_location_test"));
      tests[label] = { written: true, path: fpath, imageCount: imgs.length, images: imgs.slice(0, 5) };
    } catch (e) {
      tests[label] = { written: false, error: String(e) };
    }
  }

  return NextResponse.json({
    cwd,
    domainRoot,
    tests,
    testUrls: {
      "Try this URL (should show 1x1 image)": "/uploads/gallery/_location_test.png",
      "If above fails, try": "/api/_uploads/gallery/_location_test.png",
    },
    instructions: "After checking above URLs report which one returns an image vs 404",
  });
}

async function handleMigrate(cwd: string, persistentBase: string) {
  const versionsDir = path.resolve(cwd, "../../");
  const copied: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  let versionFolders: string[] = [];
  try { versionFolders = await readdir(versionsDir); } catch {
    return NextResponse.json({ error: `Cannot read: ${versionsDir}` }, { status: 500 });
  }
  for (const vf of versionFolders) {
    const uploadsDir = path.join(versionsDir, vf, "nodejs", "public", "uploads");
    try { await stat(uploadsDir); } catch { continue; }
    const allFiles = (await readdir(uploadsDir, { recursive: true }).catch(() => [])) as string[];
    for (const rf of allFiles) {
      const src = path.join(uploadsDir, rf);
      const dest = path.join(persistentBase, rf);
      try { const s = await stat(src); if (s.isDirectory()) continue; } catch { continue; }
      if (rf.endsWith(".gitkeep")) { skipped.push(rf); continue; }
      try { await stat(dest); skipped.push(`EXISTS:${rf}`); continue; } catch { /* ok */ }
      try {
        await mkdir(path.dirname(dest), { recursive: true });
        await copyFile(src, dest);
        copied.push(rf);
      } catch (e) { errors.push(`FAIL:${rf}—${String(e)}`); }
    }
  }
  return NextResponse.json({ persistentBase, copied: copied.length, copiedFiles: copied, skipped: skipped.length, errors });
}
