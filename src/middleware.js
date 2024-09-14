import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(
        new URL(`/${token.role.toLowerCase()}/dashboard`, request.url)
      );
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/office/:path*"],
};
