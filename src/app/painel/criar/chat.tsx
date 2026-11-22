"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { limparConversa } from "./actions";

export type Mensagem = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function Chat({
  iniciais,
  pedidoInicial,
}: {
  iniciais: Mensagem[];
  pedidoInicial: string;
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(iniciais);
  const [texto, setTexto] = useState(pedidoInicial);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState("");
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);
  const [limpando, iniciarLimpeza] = useTransition();
  const fimRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    if (pedidoInicial && campoRef.current) {
      const campo = campoRef.current;
      campo.focus();
      campo.setSelectionRange(campo.value.length, campo.value.length);
    }
  }, [pedidoInicial]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || gerando) return;

    setErro("");
    setTexto("");
    setGerando(true);
    const idResposta = `r-${Date.now()}`;
    setMensagens((atual) => [
      ...atual,
      { id: `u-${Date.now()}`, role: "user", content: mensagem },
      { id: idResposta, role: "assistant", content: "" },
    ]);

    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem }),
      });

      if (!resposta.ok || !resposta.body) {
        const dados = await resposta.json().catch(() => null);
        throw new Error(dados?.erro ?? "Não foi possível falar com o agente.");
      }

      const leitor = resposta.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await leitor.read();
        if (done) break;
        const pedaco = decoder.decode(value, { stream: true });
        setMensagens((atual) =>
          atual.map((m) =>
            m.id === idResposta ? { ...m, content: m.content + pedaco } : m,
          ),
        );
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Algo deu errado.");
      setMensagens((atual) => atual.filter((m) => m.id !== idResposta));
      setTexto(mensagem);
    } finally {
      setGerando(false);
    }
  }

  async function copiar(m: Mensagem) {
    try {
      await navigator.clipboard.writeText(m.content);
      setCopiado(m.id);
      setTimeout(() => setCopiado(""), 2000);
    } catch {
      setErro("Não consegui copiar. Selecione o texto e copie manualmente.");
    }
  }

  function limpar() {
    iniciarLimpeza(async () => {
      await limparConversa();
      setMensagens([]);
      setConfirmarLimpar(false);
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Criar</h1>
        {mensagens.length > 0 && (
          <button
            onClick={() => setConfirmarLimpar(true)}
            className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-card hover:text-foreground"
          >
            Nova conversa
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-4">
        {mensagens.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted">
            Peça uma pauta da semana, uma legenda, um roteiro de Reels ou um
            carrossel. Ex.: &quot;Escreva uma legenda sobre como gravar vídeos
            com o celular&quot;.
          </div>
        )}

        {mensagens.map((m) =>
          m.role === "user" ? (
            <div
              key={m.id}
              className="max-w-[85%] self-end whitespace-pre-wrap rounded-2xl bg-accent px-4 py-3 text-white"
            >
              {m.content}
            </div>
          ) : (
            <div
              key={m.id}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.content || (
                  <span className="text-muted">Criando…</span>
                )}
              </div>
              {m.content && !(gerando && m.id.startsWith("r-") && m === mensagens.at(-1)) && (
                <button
                  onClick={() => copiar(m)}
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                >
                  {copiado === m.id ? "Copiado" : "Copiar"}
                </button>
              )}
            </div>
          ),
        )}
        <div ref={fimRef} />
      </div>

      {erro && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {erro}
        </p>
      )}

      <form
        onSubmit={enviar}
        className="sticky bottom-0 mt-4 flex items-end gap-2 bg-background pt-2"
      >
        <textarea
          ref={campoRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={2}
          maxLength={4000}
          placeholder="O que vamos criar?"
          className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-accent"
        />
        <button
          disabled={gerando || !texto.trim()}
          className="rounded-xl bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
        >
          {gerando ? "Criando…" : "Gerar"}
        </button>
      </form>

      {confirmarLimpar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-limpar"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
            <h2 id="titulo-limpar" className="text-lg font-semibold">
              Começar uma nova conversa?
            </h2>
            <p className="mt-2 text-sm text-muted">
              As mensagens desta conversa serão apagadas. Copie antes o que
              quiser guardar.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmarLimpar(false)}
                className="rounded-lg px-4 py-2 text-sm text-muted hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={limpar}
                disabled={limpando}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
              >
                {limpando ? "Apagando…" : "Apagar e começar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
