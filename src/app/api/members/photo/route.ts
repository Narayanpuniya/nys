/**
 * Public endpoint — member registration photo upload.
 * POST /api/members/photo  (multipart/form-data, field: photo)
 * Returns { url } on success.
 */
import { NextRequest, NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const photo = form.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json({ error: "कृपया फ़ोटो चुनें।" }, { status: 400 });
    }
    const url = await saveUploadedImage(photo, "members", { maxBytes: 3 * 1024 * 1024 });
    if (!url) {
      return NextResponse.json({ error: "फ़ोटो save नहीं हो सकी।" }, { status: 500 });
    }
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "अपलोड विफल।" },
      { status: 500 },
    );
  }
}
