import { redirect } from "next/navigation";
import { brand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { sair } from "../entrar/actions";

// Depende do usuário logado: renderizada a cada acesso.
export const instant = false;

const atalhos = [
  "Gerar a pauta da semana",
  "Gerar uma legenda",
  "Gerar um roteiro de Reels",
  "Gerar um carrossel",
];

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold">{brand.name}</span>
        <form>
          <button
            formAction={sair}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-card"
          >
            Sair
          </button>
        </form>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 pt-8 pb-16">
        <p className="text-sm text-muted">{user.email}</p>
        <h1 className="mt-1 text-3xl font-bold">O que vamos criar hoje?</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {atalhos.map((texto) => (
            <div
              key={texto}
              className="rounded-xl border border-border bg-card p-5 text-muted"
            >
              <p className="font-semibold text-foreground">{texto}</p>
              <p className="mt-1 text-sm">Disponível na próxima etapa.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
