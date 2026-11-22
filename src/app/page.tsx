import Link from "next/link";
import { brand } from "@/lib/brand";

const entregas = [
  {
    titulo: "Pauta da semana",
    texto: "Um calendário com tema, formato e rede de cada dia.",
  },
  {
    titulo: "Legendas prontas",
    texto: "Texto, chamada para ação e hashtags no tom da sua marca.",
  },
  {
    titulo: "Roteiros de Reels",
    texto: "Gancho, falas e cenas para gravar sem travar.",
  },
  {
    titulo: "Carrosséis",
    texto: "O texto de cada lâmina e as imagens nas suas cores.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold">{brand.name}</span>
        <Link
          href="/entrar"
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-card"
        >
          Entrar
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 pt-16 pb-12">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          {brand.tagline}
        </h1>
        <p className="max-w-xl text-lg text-muted">{brand.description}</p>
        <Link
          href="/entrar?modo=cadastro"
          className="rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-strong"
        >
          Começar agora
        </Link>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-20 sm:grid-cols-2">
        {entregas.map((item) => (
          <div
            key={item.titulo}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h2 className="font-semibold">{item.titulo}</h2>
            <p className="mt-1 text-sm text-muted">{item.texto}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
