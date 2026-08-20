import { NextResponse } from "next/server";
import { readdir, stat, mkdir, copyFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export async function GET(req: Request) {
  const cwd = process.cwd();
  const url = new URL(req.url);

  const persistentBase = cwd.includes("/hbuilds/versions/")
    ? path.resolve(cwd, "../../../../uploads")
    : path.join(cwd, "public", "uploads");

  // Source repo path derived from __filename
  let sourceRepoUploads = "";
  try {
    const __filename = fileURLToPath(import.meta.url);
    // __filename = /home/.../hbuilds/source/repository/src/app/api/debug-uploads/route.ts
    // go up 6 levels to get repo root
    const repoRoot = path.resolve(path.dirname(__filename), "../../../../../..");
    sourceRepoUploads = path.join(repoRoot, "public", "uploads");
  } catch { /* ignore */ }

  if (url.searchParams.get("migrate") === "1") {
    return handleMigrate(cwd, persistentBase, sourceRepoUploads);
  }

  // Check all candidate paths
  const checkPaths = [
    persistentBase,
    sourceRepoUploads,
    path.join(cwd, "public", "uploads"),
  ].filter(Boolean);

  const results: Record<string, unknown> = {
    cwd,
    persistentBase,
    sourceRepoUploads,
    isHostinger: cwd.includes("/hbuilds/versions/"),
    paths: {},
  };

  for (const dir of checkPaths) {
    try {
      const s = await stat(dir);
      if (s.isDirectory()) {
        const files = (await readdir(dir, { recursive: true }).catch(() => [])) as string[];
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        (results.paths as Record<string, unknown>)[dir] = {
          exists: true,
          totalFiles: files.length,
          imageFiles: imageFiles.length,
          sample: imageFiles.slice(0, 5),
        };
      }
    } catch {
      (results.paths as Record<string, unknown>)[dir] = { exists: false };
    }
  }

  // Write test
  const testDir = path.join(persistentBase, "gallery");
  const testFile = path.join(testDir, "_test_write.txt");
  try {
    await mkdir(testDir, { recursive: true });
    await writeFile(testFile, "write test ok");
    await unlink(testFile);
    (results as Record<string, unknown>).writeTest = "✅ writable";
  } catch (e) {
    (results as Record<string, unknown>).writeTest = `❌ ${String(e)}`;
  }

  return NextResponse.json(results);
}

async function handleMigrate(cwd: string, persistentBase: string, sourceRepoUploads: string) {
  const versionsDir = path.resolve(cwd, "../../");
  const copied: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  // Search in multiple places
  const searchBases: string[] = [sourceRepoUploads];
  try {
    const versionFolders = await readdir(versionsDir);
    for (const vf of versionFolders) {
      searchBases.push(path.join(versionsDir, vf, "nodejs", "public", "uploads"));
    }
  } catch { /* ignore */ }

  for (const uploadsDir of searchBases.filter(Boolean)) {
    try { await stat(uploadsDir); } catch { continue; }

    const allFiles = (await readdir(uploadsDir, { recursive: true }).catch(() => [])) as string[];
    for (const relFile of allFiles) {
      const srcFile = path.join(uploadsDir, relFile);
      const destFile = path.join(persistentBase, relFile);

      try {
        const s = await stat(srcFile);
        if (s.isDirectory()) continue;
      } catch { continue; }

      if (relFile.endsWith(".gitkeep")) { skipped.push(relFile); continue; }

      try { await stat(destFile); skipped.push(`EXISTS:${relFile}`); continue; } catch { /* ok */ }

      try {
        await mkdir(path.dirname(destFile), { recursive: true });
        await copyFile(srcFile, destFile);
        copied.push(relFile);
      } catch (e) {
        errors.push(`FAIL:${relFile}—${String(e)}`);
      }
    }
  }

  return NextResponse.json({
    persistentBase,
    searchedIn: searchBases,
    copied: copied.length,
    copiedFiles: copied,
    skipped: skipped.length,
    errors,
    status: copied.length > 0 ? `✅ ${copied.length} files recovered!` : "❌ No files found to copy",
  });
}
