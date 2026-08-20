import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export async function GET() {
  const cwd = process.cwd();

  // Check candidates
  const candidates = [
    path.join(cwd, "public", "uploads"),
    path.join(cwd, "..", "public", "uploads"),
    path.join(cwd, "..", "..", "public", "uploads"),
  ];

  const results: Record<string, unknown> = { cwd, candidates: {} };

  for (const dir of candidates) {
    try {
      const s = await stat(dir);
      if (s.isDirectory()) {
        const files = await readdir(dir, { recursive: true });
        (results.candidates as Record<string, unknown>)[dir] = {
          exists: true,
          count: files.length,
          sample: files.slice(0, 5),
        };
      }
    } catch {
      (results.candidates as Record<string, unknown>)[dir] = { exists: false };
    }
  }

  // __filename path
  try {
    const __filename = fileURLToPath(import.meta.url);
    results.__filename = __filename;
  } catch {
    results.__filename = "n/a";
  }

  return NextResponse.json(results);
}
