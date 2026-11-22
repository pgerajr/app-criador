import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest } from "next/server";
import {
  HISTORICO,
  instrucoes,
  LIMITE_DIARIO,
  MAX_TOKENS,
  MODELO,
  TAMANHO_MAXIMO,
} from "@/lib/agente";
import { buscarPerfil } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente

function erro(mensagem: string, status: number) {
  return Response.json({ erro: mensagem }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return erro("Faça login de novo.", 401);

  const corpo = await request.json().catch(() => null);
  const mensagem = String(corpo?.mensagem ?? "").trim();
  if (!mensagem) return erro("Escreva o que você quer criar.", 400);
  if (mensagem.length > TAMANHO_MAXIMO)
    return erro("Mensagem longa demais. Resuma um pouco.", 400);

  // Trava provisória de uso até os créditos por plano entrarem (etapa 4).
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "user")
    .gte("created_at", desde);
  if ((count ?? 0) >= LIMITE_DIARIO)
    return erro("Você chegou ao limite de pedidos de hoje.", 429);

  const [perfil, { data: anteriores }] = await Promise.all([
    buscarPerfil(supabase, user.id),
    supabase
      .from("messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(HISTORICO),
  ]);

  const historico = (anteriores ?? []).reverse();
  // A conversa enviada ao modelo precisa começar com uma mensagem do usuário.
  while (historico.length && historico[0].role !== "user") historico.shift();

  await supabase
    .from("messages")
    .insert({ user_id: user.id, role: "user", content: mensagem });

  const stream = anthropic.messages.stream({
    model: MODELO,
    max_tokens: MAX_TOKENS,
    system: instrucoes(perfil),
    messages: [
      ...historico.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: mensagem },
    ],
  });

  const encoder = new TextEncoder();
  const corpoResposta = new ReadableStream<Uint8Array>({
    async start(controller) {
      let texto = "";
      try {
        for await (const evento of stream) {
          if (
            evento.type === "content_block_delta" &&
            evento.delta.type === "text_delta"
          ) {
            texto += evento.delta.text;
            controller.enqueue(encoder.encode(evento.delta.text));
          }
        }
        if (texto) {
          await supabase
            .from("messages")
            .insert({ user_id: user.id, role: "assistant", content: texto });
        }
      } catch (e) {
        console.error("Erro no agente:", e);
        controller.enqueue(
          encoder.encode(
            "\n\n[Não consegui terminar a resposta agora. Tente de novo em instantes.]",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(corpoResposta, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
