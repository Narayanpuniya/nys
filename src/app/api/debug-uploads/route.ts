import { NextResponse } from "next/server";
import { readdir, stat, mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

export async function GET() {
  const cwd = process.cwd();

  // Persistent path (Hostinger fix)
  const persistentBase = cwd.includes("/hbuilds/versions/")
    ? path.resolve(cwd, "../../../../uploads")
    : path.join(cwd, "public", "uploads");

  const results: Record<string, unknown> = {
    cwd,
    persistentBase,
    isHostinger: cwd.includes("/hbuilds/versions/"),
    paths: {},
    writeTest: null,
  };

  // Check persistent path
  for (const dir of [persistentBase, path.join(cwd, "public", "uploads")]) {
    try {
      const s = await stat(dir);
      if (s.isDirectory()) {
        const files = await readdir(dir, { recursive: true }).catch(() => []);
        (results.paths as Record<string, unknown>)[dir] = {
          exists: true,
          count: files.length,
          sample: files.slice(0, 8),
        };
      }
    } catch {
      (results.paths as Record<string, unknown>)[dir] = { exists: false };
    }
  }

  // Write test to persistent path
  const testDir = path.join(persistentBase, "gallery");
  const testFile = path.join(testDir, "_test_write.txt");
  try {
    await mkdir(testDir, { recursive: true });
    await writeFile(testFile, "write test ok");
    await unlink(testFile); // cleanup
    (results as Record<string, unknown>).writeTest = "✅ writable";
  } catch (e) {
    (results as Record<string, unknown>).writeTest = `❌ ${String(e)}`;
  }

  return NextResponse.json(results, { status: 200 });
}
