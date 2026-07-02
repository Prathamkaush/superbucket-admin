import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login"]);
const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboard",
  SUB_ADMIN: "/inventory",
  PICKER: "/orders",
};

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  ADMIN: ["/"],
  SUB_ADMIN: ["/inventory", "/shops", "/staff", "/picker-reports"],
  PICKER: ["/orders"],
};

function decodeRole(token?: string) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json)?.role || null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = decodeRole(token);
  const allowed = role ? ROLE_ALLOWED_PREFIXES[role] : null;

  if (
    allowed &&
    !allowed.includes("/") &&
    !allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] || "/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\..*).*)"],
};
