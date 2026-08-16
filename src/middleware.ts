import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Admin routes protection (edge)। /admin/login को छोड़कर सभी /admin routes पर
// valid session cookie आवश्यक है। Fine-grained permission checks pages में होते हैं।
const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = req.cookies.get("nys_session")?.value;
    if (!token) return redirectLogin(req);
    try {
      await jwtVerify(token, secret());
      return NextResponse.next();
    } catch {
      return redirectLogin(req);
    }
  }
  return NextResponse.next();
}

function redirectLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
