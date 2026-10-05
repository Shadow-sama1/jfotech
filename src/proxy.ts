import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/account", "/checkout", "/order-confirmation"];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requiresAuth = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`));
  if (!requiresAuth) return NextResponse.next();

  const hasSession = Boolean(
    request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value,
  );
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${path}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/order-confirmation/:path*"],
};