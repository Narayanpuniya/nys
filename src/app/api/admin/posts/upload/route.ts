import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";
import { saveUploadedImage } from "@/lib/upload";

// POST /api/admin/posts/upload
// Accepts: multipart/form-data { file }
// Returns: { url: "/uploads/gallery/..." }
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.POSTS_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file || file.size === 0)
      return NextResponse.json({ error: "कोई फ़ाइल नहीं मिली।" }, { status: 400 });

    // 8 MB limit for post images
    const url = await saveUploadedImage(file, "gallery", {
      maxBytes: 8 * 1024 * 1024,
      allowPdf: false,
    });

    if (!url)
      return NextResponse.json(
        { error: "छवि सहेजी नहीं जा सकी। Hostinger uploads folder जाँचें।" },
        { status: 500 },
      );

    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "अज्ञात त्रुटि";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
