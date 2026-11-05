import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { safeReturnPath } from "@/helpers/auth/return-path";
import { hasAdminEmail } from "@/helpers/auth/user-profile";

const isAuthPage = createRouteMatcher(["/login", "/signup", "/forgot-password", "/verify-otp"]);
const isAccount = createRouteMatcher(["/dashboard(.*)", "/account(.*)", "/orders(.*)"]);
const isAdmin = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isAccount(request) && !isAdmin(request) && !isAuthPage(request)) return;
  const session = await auth();
  if (isAuthPage(request)) {
    if (session.userId) return NextResponse.redirect(new URL(safeReturnPath(request.nextUrl.searchParams.get("redirect_url")), request.url));
    return;
  }
  if (!session.userId) {
    if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    return session.redirectToSignIn({ returnBackUrl: request.url });
  }
  if (isAdmin(request)) {
    const user = await (await clerkClient()).users.getUser(session.userId);
    if (!hasAdminEmail(user, process.env.ADMIN_EMAILS ?? "")) {
      if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "You don’t have access to this page." }, { status: 403 });
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
}, { signInUrl: "/login", signUpUrl: "/signup" });

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)", "/__clerk/:path*"],
};
