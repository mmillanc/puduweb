import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) ||
    pathname.startsWith("/negocio");

  if (isProtected) {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-"));

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/negocio/:path*"],
};
