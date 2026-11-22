import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Chat, type Mensagem } from "./chat";

export const instant = false;

export default async function CriarPage({
  searchParams,
}: PageProps<"/painel/criar">) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data } = await supabase
    .from("messages")
    .select("id, role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(100);

  const mensagens: Mensagem[] = (data ?? []).map((m) => ({
    id: String(m.id),
    role: m.role as Mensagem["role"],
    content: m.content,
  }));

  const pedido = typeof params.pedido === "string" ? params.pedido : "";

  return <Chat iniciais={mensagens} pedidoInicial={pedido} />;
}
