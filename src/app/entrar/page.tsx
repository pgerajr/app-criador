import Link from "next/link";
import { brand } from "@/lib/brand";
import { cadastrar, entrar } from "./actions";

// Página que depende do pedido (mensagens na URL): renderizada a cada acesso.
export const instant = false;

const erros: Record<string, string> = {
  login: "E-mail ou senha incorretos.",
  senha: "A senha precisa ter pelo menos 8 caracteres.",
  cadastro: "Não foi possível criar a conta. Confira o e-mail e tente de novo.",
  link: "O link de confirmação expirou ou já foi usado. Entre com seu e-mail e senha.",
};

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const params = await searchParams;
  const cadastro = params.modo === "cadastro";
  const erro = typeof params.erro === "string" ? erros[params.erro] : undefined;
  const confirme = params.aviso === "confirme";

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          {brand.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {cadastro ? "Criar sua conta" : "Entrar"}
        </h1>

        {erro && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {erro}
          </p>
        )}
        {confirme && (
          <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
            Enviamos um link para o seu e-mail. Confirme e depois entre aqui.
          </p>
        )}

        <form className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            E-mail
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Senha
            <input
              name="password"
              type="password"
              required
              minLength={cadastro ? 8 : undefined}
              autoComplete={cadastro ? "new-password" : "current-password"}
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <button
            formAction={cadastro ? cadastrar : entrar}
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-strong"
          >
            {cadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {cadastro ? (
            <>
              Já tem conta?{" "}
              <Link href="/entrar" className="text-accent hover:underline">
                Entrar
              </Link>
            </>
          ) : (
            <>
              Ainda não tem conta?{" "}
              <Link
                href="/entrar?modo=cadastro"
                className="text-accent hover:underline"
              >
                Criar conta
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
