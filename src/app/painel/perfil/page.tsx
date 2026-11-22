import { redirect } from "next/navigation";
import { buscarPerfil, perfilVazio, REDES } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";
import { salvarPerfil } from "./actions";

export const instant = false;

const campoClasse =
  "rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent";

export default async function PerfilPage({
  searchParams,
}: PageProps<"/painel/perfil">) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const perfil = (await buscarPerfil(supabase, user.id)) ?? perfilVazio;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <h1 className="text-3xl font-bold">Perfil da marca</h1>
      <p className="mt-2 text-muted">
        Tudo o que o agente cria parte daqui. Quanto mais detalhe, mais o
        conteúdo soa como você.
      </p>

      {params.salvo && (
        <p className="mt-6 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          Perfil salvo.
        </p>
      )}
      {params.erro && (
        <p className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Não foi possível salvar. Tente de novo.
        </p>
      )}

      <form action={salvarPerfil} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm">
          Nome da marca ou do perfil
          <input
            name="nome_marca"
            defaultValue={perfil.nome_marca}
            placeholder="Ex.: @paologera1"
            className={campoClasse}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Nicho *
          <input
            name="nicho"
            required
            defaultValue={perfil.nicho}
            placeholder="Ex.: inteligência artificial para criadores de conteúdo"
            className={campoClasse}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Para quem você fala *
          <textarea
            name="publico"
            required
            rows={3}
            defaultValue={perfil.publico}
            placeholder="Ex.: pequenos empreendedores que querem produzir vídeos sozinhos"
            className={campoClasse}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tom de voz *
          <textarea
            name="tom"
            required
            rows={3}
            defaultValue={perfil.tom}
            placeholder="Ex.: direto, didático e bem-humorado, sem termos técnicos"
            className={campoClasse}
          />
        </label>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">Redes onde você posta</legend>
          <div className="flex flex-wrap gap-2">
            {REDES.map((rede) => (
              <label
                key={rede}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                <input
                  type="checkbox"
                  name="redes"
                  value={rede}
                  defaultChecked={perfil.redes.includes(rede)}
                  className="accent-accent"
                />
                {rede}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          Cores da marca
          <input
            name="cores"
            defaultValue={perfil.cores}
            placeholder="Ex.: azul #2563EB, preto e branco"
            className={campoClasse}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Exemplos de posts seus (opcional)
          <textarea
            name="exemplos"
            rows={6}
            defaultValue={perfil.exemplos}
            placeholder="Cole 2 ou 3 legendas que você já publicou e gostou"
            className={campoClasse}
          />
        </label>

        <button className="self-start rounded-lg bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-strong">
          Salvar perfil
        </button>
      </form>
    </main>
  );
}
