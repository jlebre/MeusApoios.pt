import Link from "next/link";
import BrandLogo from "./BrandLogo";

// Barra de navegação global para páginas públicas.
// Sem "use client" — compatível com server e client components.
export default function NavBar() {
  return (
    <nav className="flex items-center justify-between">
      <Link
        href="/"
        className="font-display text-xl font-black tracking-tight text-soil"
      >
        <BrandLogo />
      </Link>
      <div className="flex items-center gap-1 sm:gap-3">
        <Link
          href="/apoios"
          className="hidden sm:block rounded-md px-3 py-1.5 text-sm font-medium text-ink/70 hover:bg-clay/10 hover:text-soil"
        >
          Apoios
        </Link>
        <Link
          href="/calendario"
          className="hidden sm:block rounded-md px-3 py-1.5 text-sm font-medium text-ink/70 hover:bg-clay/10 hover:text-soil"
        >
          Calendário
        </Link>
        <Link
          href="/favoritos"
          className="hidden sm:block rounded-md px-3 py-1.5 text-sm font-medium text-ink/70 hover:bg-clay/10 hover:text-soil"
        >
          Favoritos
        </Link>
        <Link
          href="/areas"
          className="hidden sm:block btn-primary text-sm"
        >
          Diagnóstico
        </Link>
        <Link href="/perfil" className="btn-ghost text-sm">
          Perfil
        </Link>
      </div>
    </nav>
  );
}
