import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/";

  if (token) {
    // Restrict access to admin pages
    if (
      ((pathname.startsWith("/lost-items") ||
        pathname.startsWith("/found-items")) &&
        !token.permissions.includes("Manage Items")) ||
      (pathname.startsWith("/item-retrieval") &&
        !token.permissions.includes("Manage Item Retrievals")) ||
      (pathname.startsWith("/users") &&
        !token.permissions.includes("Manage Users")) ||
      (pathname.startsWith("/role") &&
        !token.permissions.includes("Manage Roles")) ||
      (pathname.startsWith("/locations") &&
        !token.permissions.includes("Manage Locations")) ||
      (pathname.startsWith("/my-items") &&
        !token.permissions.includes("View My Items")) ||
      (pathname.startsWith("/profile") &&
        !token.permissions.includes("View Profile"))
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // Redirect unauthenticated users to the login page for protected routes
  if (!isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/found-items",
    "/item-retrieval",
    "/lost-items",
    "/role",
    "/users",
    "/profile",
    "/my-items/:path*",
  ], // Add all necessary protected routes
};
