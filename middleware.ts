// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    /*
      Match all routes except static files and auth pages
      Adjust paths as needed
    */
    "/((?!_next|static|favicon.ico|login|signup|sign-in|sign-up).*)",
  ],
};
