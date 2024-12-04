import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/";

  const adminPages = [
    "/admin",
    "/badges",
    "/found-items",
    "/item-history",
    "/item-retrieval",
    "/lost-items",
    "/roles",
    "/users",
  ];

  const userPages = ["/profile", "/my-items"];

  if (token) {
    const userRole = token.userType;

    // Restrict access to admin pages
    if (
      adminPages.some((adminPath) => pathname.startsWith(adminPath)) &&
      userRole !== "admin"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Restrict access to user-specific pages
    if (
      userPages.some((userPath) => pathname.startsWith(userPath)) &&
      userRole !== "user"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (userRole === 'admin') {
      if (
        (pathname === '/admin' && !token.permissions.viewAdminsList) ||
        (pathname === '/badges' && !token.permissions.viewBadges) ||
        (pathname === '/found-items' && !token.permissions.manageRequestReportedFoundItems) ||
        (pathname === '/item-retrieval' && !token.permissions.manageRequestItemRetrieval) ||
        (pathname === '/lost-items' && !token.permissions.manageRequestReportedLostItems) ||
        (pathname === '/roles' && !token.permissions.viewRoles) ||
        (pathname === '/users' && !token.permissions.viewStudentsList)
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // Prevent authenticated users from accessing the login page
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
    "/admin",
    "/badges",
    "/found-items",
    "/item-history",
    "/item-retrieval",
    "/lost-items",
    "/roles",
    "/users",
    "/profile",
    "/my-items/:path*",
  ], // Add all necessary protected routes
};
