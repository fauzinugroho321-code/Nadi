import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const role = req.auth?.user?.role;
  const path = req.nextUrl.pathname;

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (path.startsWith("/boss") && role !== "BOSS") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (path.startsWith("/hr") && !["HR", "BOSS"].includes(role as string)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (path.startsWith("/employee") && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
});

export const config = {
  matcher: ["/boss/:path*", "/hr/:path*", "/employee/:path*"]
};
