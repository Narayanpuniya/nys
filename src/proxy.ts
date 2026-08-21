import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Admin + Member routes protection (edge)।
// /admin/login और /login को छोड़कर protected routes पर valid session cookie आवश्यक है।
const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me");

export async function proxy(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // ── Admin routes ─────────────────────────────────────────────────────────
    // /admin/login को /login पर redirect (unified login page)
    if (pathname === "/admin/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("tab", "admin");
      // next param preserve करें ताकि login के बाद वापस जा सके
      const next = req.nextUrl.searchParams.get("next");
      if (next) url.searchParams.set("next", next);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      const token = req.cookies.get("nys_session")?.value;
      if (!token) return redirectAdminLogin(req);
      try {
        await jwtVerify(token, secret());
        return NextResponse.next();
      } catch {
        return redirectAdminLogin(req);
      }
    }

    // ── Member portal ────────────────────────────────────────────────────────
    if (pathname.startsWith("/member") && pathname !== "/member/logout") {
      const token = req.cookies.get("nys_member_session")?.value;
      if (!token) return redirectMemberLogin(req);
      try {
        await jwtVerify(token, secret());
        return NextResponse.next();
      } catch {
        return redirectMemberLogin(req);
      }
    }

    return NextResponse.next();
  } catch {
    // Edge quirks — कभी middleware crash न हो
    return NextResponse.next();
  }
}

function redirectAdminLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("tab", "admin");
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectMemberLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("tab", "member");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/member/:path*"],
};
