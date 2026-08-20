import { NextResponse } from "next/server";
import { readdir, stat, mkdir, copyFile, writeFile, unlink } from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  const cwd = process.cwd();
  const url = new URL(req.url);

  const persistentBase = cwd.includes("/hbuilds/versions/")
    ? path.resolve(cwd, "../../../../uploads")
    : path.join(cwd, "public", "uploads");

  // ?migrate=1 → copy all old versioned photos to persistent path
  if (url.searchParams.get("migrate") === "1") {
    return handleMigrate(cwd, persistentBase);
  }

  // Default: show status
  const results: Record<string, unknown> = {
    cwd,
    persistentBase,
    isHostinger: cwd.includes("/hbuilds/versions/"),
    paths: {},
    writeTest: null,
    hint: "Add ?migrate=1 to copy old photos to persistent path",
  };

  for (const dir of [persistentBase, path.join(cwd, "public", "uploads")]) {
    try {
      const s = await stat(dir);
      if (s.isDirectory()) {
        const files = await readdir(dir, { recursive: true }).catch(() => []);
        (results.paths as Record<string, unknown>)[dir] = { exists: true, count: files.length, sample: files.slice(0, 8) };
      }
    } catch {
      (results.paths as Record<string, unknown>)[dir] = { exists: false };
    }
  }

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

async function handleMigrate(cwd: string, persistentBase: string) {
  const versionsDir = path.resolve(cwd, "../../"); // /hbuilds/versions/
  const copied: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  let versionFolders: string[] = [];
  try {
    versionFolders = await readdir(versionsDir);
  } catch (e) {
    return NextResponse.json({ error: `Cannot read versions dir: ${versionsDir} — ${String(e)}` }, { status: 500 });
  }

  for (const vfolder of versionFolders) {
    const uploadsDir = path.join(versionsDir, vfolder, "nodejs", "public", "uploads");
    try {
      await stat(uploadsDir);
    } catch {
      continue; // folder doesn't exist, skip
    }

    // Walk all files in this old versioned uploads dir
    let allFiles: string[] = [];
    try {
      allFiles = (await readdir(uploadsDir, { recursive: true })) as string[];
    } catch {
      continue;
    }

    for (const relFile of allFiles) {
      const srcFile = path.join(uploadsDir, relFile);
      const destFile = path.join(persistentBase, relFile);

      // Skip .gitkeep and directories
      try {
        const s = await stat(srcFile);
        if (s.isDirectory()) continue;
      } catch {
        continue;
      }

      if (relFile.endsWith(".gitkeep")) {
        skipped.push(relFile);
        continue;
      }

      // Already exists at destination?
      try {
        await stat(destFile);
        skipped.push(`EXISTS: ${relFile}`);
        continue;
      } catch { /* doesn't exist, copy it */ }

      try {
        await mkdir(path.dirname(destFile), { recursive: true });
        await copyFile(srcFile, destFile);
        copied.push(`${vfolder.substring(0, 8)}… → ${relFile}`);
      } catch (e) {
        errors.push(`FAIL: ${relFile} — ${String(e)}`);
      }
    }
  }

  return NextResponse.json({
    versionsDir,
    persistentBase,
    versionFoldersFound: versionFolders.length,
    copied: copied.length,
    copiedFiles: copied,
    skipped: skipped.length,
    errors,
    status: errors.length === 0 ? "✅ Migration complete" : "⚠️ Some errors",
  });
}
