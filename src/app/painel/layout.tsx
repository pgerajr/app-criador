import Link from "next/link";
import { brand } from "@/lib/brand";
import { sair } from "../entrar/actions";

const links = [
  { href: "/painel", texto: "Início" },
  { href: "/painel/criar", texto: "Criar" },
  { href: "/painel/perfil", texto: "Perfil da marca" },
];

export default function PainelLayout({ children }: LayoutProps<"/painel">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/painel" className="text-lg font-semibold">
            {brand.name}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-muted hover:bg-card hover:text-foreground"
              >
                {link.texto}
              </Link>
            ))}
            <form>
              <button
                formAction={sair}
                className="rounded-lg px-3 py-2 text-muted hover:bg-card hover:text-foreground"
              >
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
