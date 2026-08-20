import { NextResponse } from "next/server";
import { readdir, stat, mkdir, writeFile, unlink, copyFile } from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  const cwd = process.cwd();
  const url = new URL(req.url);

  const persistentBase = cwd.includes("/hbuilds/versions/")
    ? path.resolve(cwd, "../../../../uploads")
    : path.join(cwd, "public", "uploads");

  if (url.searchParams.get("migrate") === "1") {
    return handleMigrate(cwd, persistentBase);
  }

  // Test: write a real image (1x1 pixel transparent PNG) to persistent path
  const testImageName = "_test_image.png";
  const testImagePath = path.join(persistentBase, "gallery", testImageName);
  // 1x1 transparent PNG bytes
  const PNG_1x1 = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489000000" +
    "0a49444154789c6260000000020001e221bc330000000049454e44ae426082",
    "hex"
  );

  let uploadTest = "";
  let serveTest = "";

  try {
    await mkdir(path.join(persistentBase, "gallery"), { recursive: true });
    await writeFile(testImagePath, PNG_1x1);
    uploadTest = "✅ File written to persistent path";

    // Check serve URL
    serveTest = `Test it: /uploads/gallery/${testImageName}`;
  } catch (e) {
    uploadTest = `❌ Write failed: ${String(e)}`;
  }

  // List all image files in persistent path
  let persistentImages: string[] = [];
  try {
    const files = (await readdir(persistentBase, { recursive: true })) as string[];
    persistentImages = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f) && !f.startsWith("_test"));
  } catch { /* empty */ }

  return NextResponse.json({
    cwd,
    persistentBase,
    uploadTest,
    serveTest,
    persistentImagesCount: persistentImages.length,
    persistentImages: persistentImages.slice(0, 10),
    hint: persistentImages.length === 0
      ? "No real images yet — upload one from admin panel then re-check"
      : `${persistentImages.length} images found in persistent storage ✅`,
  });
}

async function handleMigrate(cwd: string, persistentBase: string) {
  const versionsDir = path.resolve(cwd, "../../");
  const copied: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  let versionFolders: string[] = [];
  try { versionFolders = await readdir(versionsDir); } catch {
    return NextResponse.json({ error: `Cannot read versions dir: ${versionsDir}` }, { status: 500 });
  }

  for (const vfolder of versionFolders) {
    const uploadsDir = path.join(versionsDir, vfolder, "nodejs", "public", "uploads");
    try { await stat(uploadsDir); } catch { continue; }
    const allFiles = (await readdir(uploadsDir, { recursive: true }).catch(() => [])) as string[];
    for (const relFile of allFiles) {
      const srcFile = path.join(uploadsDir, relFile);
      const destFile = path.join(persistentBase, relFile);
      try { const s = await stat(srcFile); if (s.isDirectory()) continue; } catch { continue; }
      if (relFile.endsWith(".gitkeep") || relFile.startsWith("_test")) { skipped.push(relFile); continue; }
      try { await stat(destFile); skipped.push(`EXISTS:${relFile}`); continue; } catch { /* ok */ }
      try {
        await mkdir(path.dirname(destFile), { recursive: true });
        await copyFile(srcFile, destFile);
        copied.push(relFile);
      } catch (e) { errors.push(`FAIL:${relFile}—${String(e)}`); }
    }
  }

  return NextResponse.json({
    persistentBase,
    versionFoldersFound: versionFolders.length,
    copied: copied.length,
    copiedFiles: copied,
    skipped: skipped.length,
    errors,
    status: copied.length > 0 ? `✅ ${copied.length} files recovered!` : "❌ No files found",
  });
}
