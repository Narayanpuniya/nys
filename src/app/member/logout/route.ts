import { NextResponse } from "next/server";
import { destroyMemberSession } from "@/lib/member-auth";

export async function GET() {
  await destroyMemberSession();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
