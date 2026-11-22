import Link from "next/link";
import { redirect } from "next/navigation";
import { buscarPerfil, perfilCompleto } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

// Depende do usuário logado: renderizada a cada acesso.
export const instant = false;

const atalhos = [
  {
    titulo: "Pauta da semana",
    pedido: "Monte a minha pauta de conteúdo para os próximos 7 dias.",
  },
  {
    titulo: "Legenda",
    pedido: "Escreva uma legenda para um post sobre ",
  },
  {
    titulo: "Roteiro de Reels",
    pedido: "Escreva um roteiro de Reels de até 30 segundos sobre ",
  },
  {
    titulo: "Carrossel",
    pedido: "Escreva o texto de um carrossel de 7 lâminas sobre ",
  },
];

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const perfil = await buscarPerfil(supabase, user.id);
  const pronto = perfilCompleto(perfil);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-8 pb-16">
      <p className="text-sm text-muted">{user.email}</p>
      <h1 className="mt-1 text-3xl font-bold">O que vamos criar hoje?</h1>

      {!pronto && (
        <div className="mt-6 rounded-xl border border-accent/50 bg-accent/10 p-5">
          <p className="font-semibold">Primeiro, conte sobre a sua marca</p>
          <p className="mt-1 text-sm text-muted">
            Leva 2 minutos e faz o agente escrever no seu tom.
          </p>
          <Link
            href="/painel/perfil"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Preencher o perfil
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {atalhos.map((atalho) => (
          <Link
            key={atalho.titulo}
            href={{ pathname: "/painel/criar", query: { pedido: atalho.pedido } }}
            className="rounded-xl border border-border bg-card p-5 hover:border-accent"
          >
            <p className="font-semibold">Gerar {atalho.titulo.toLowerCase()}</p>
            <p className="mt-1 text-sm text-muted">{atalho.pedido}…</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
