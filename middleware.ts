import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const role = (req.auth?.user as any)?.role;
  const path = req.nextUrl.pathname;

  
  if (req.auth && (path === "/" || path === "/login")) {
    if (role === "BOSS") return NextResponse.redirect(new URL("/boss/dashboard", req.url));
    if (role === "HR") return NextResponse.redirect(new URL("/hr/dashboard", req.url));
    if (role === "EMPLOYEE") return NextResponse.redirect(new URL("/employee/dashboard", req.url));
  }

  
  if (!req.auth && path !== "/login" && path !== "/login/forgot-password") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  
  if (path.startsWith("/boss") && role !== "BOSS") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  

  if (path.startsWith("/hr") && role !== "HR") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  
  
  if (path.startsWith("/employee") && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
});

export const config = {

  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|nadi.jpg).*)"],
};