import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BRAND } from "@/lib/brand";

// Proteção mínima do backoffice por Basic Auth.
// Suficiente para o MVP / uso pessoal. Antes de partilhares com terceiros,
// troca por auth a sério (Supabase Auth / NextAuth).
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const auth = req.headers.get("authorization");
    const expected = process.env.ADMIN_PASSWORD;
    if (auth) {
      const [, encoded] = auth.split(" ");
      const decoded = Buffer.from(encoded, "base64").toString();
      const [, pass] = decoded.split(":");
      if (pass === expected) return NextResponse.next();
    }
    return new NextResponse("Autenticação necessária", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="${BRAND.name} Admin"` },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
