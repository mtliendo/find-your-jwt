import { NextResponse } from "next/server";
import { isAuth0Configured } from "@/lib/auth-config";
import { auth0 } from "@/lib/auth0";
import {
  GUEST_COOKIE,
  GUEST_HEADER,
  guestCookieOptions,
  mintGuestIdentity,
  parseGuestIdentity,
} from "@/lib/guest-identity";

function readGuestCookie(request: Request) {
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${GUEST_COOKIE}=`))
    ?.slice(GUEST_COOKIE.length + 1);

  if (!raw) return null;
  return (
    parseGuestIdentity(raw) ?? parseGuestIdentity(decodeURIComponent(raw))
  );
}

export async function proxy(request: Request) {
  const url = new URL(request.url);
  const existing = readGuestCookie(request);
  const identity = existing ?? mintGuestIdentity();

  if (url.pathname.startsWith("/auth/")) {
    if (!isAuth0Configured()) {
      return NextResponse.next();
    }
    return auth0.middleware(request);
  }

  if (!existing) {
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(
      GUEST_COOKIE,
      JSON.stringify(identity),
      guestCookieOptions,
    );
    return redirect;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(GUEST_HEADER, JSON.stringify(identity));

  if (isAuth0Configured()) {
    return auth0.middleware(request);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
