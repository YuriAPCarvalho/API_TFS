import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/app/utils/authCookie";
import { decryptPassword } from "@/app/utils/encryption";

const PROTECTED_PREFIXES = ["/formulario"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("auth", "expired");

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!authCookie) {
    return redirectToLogin(request);
  }

  try {
    let parsed: { usuario?: string; senha?: string };
    try {
      parsed = JSON.parse(decodeURIComponent(authCookie));
    } catch {
      parsed = JSON.parse(authCookie);
    }

    if (!parsed?.usuario || !parsed?.senha) {
      return redirectToLogin(request);
    }

    const senha = decryptPassword(parsed.senha);
    const validateUrl = new URL("/api/GetSprints", request.url);

    const response = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: parsed.usuario,
        senha,
      }),
      cache: "no-store",
    });

    if (response.status === 401) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/formulario/:path*"],
};
