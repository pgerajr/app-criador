"use server";

import { redirect } from "next/navigation";
import { REDES } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

const texto = (formData: FormData, campo: string, max = 2000) =>
  String(formData.get(campo) ?? "").trim().slice(0, max);

export async function salvarPerfil(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const redes = formData
    .getAll("redes")
    .map(String)
    .filter((rede) => REDES.includes(rede));

  const { error } = await supabase.from("brand_profiles").upsert({
    user_id: user.id,
    nome_marca: texto(formData, "nome_marca", 120),
    nicho: texto(formData, "nicho", 300),
    publico: texto(formData, "publico", 500),
    tom: texto(formData, "tom", 500),
    redes,
    cores: texto(formData, "cores", 200),
    exemplos: texto(formData, "exemplos", 4000),
    updated_at: new Date().toISOString(),
  });

  if (error) redirect("/painel/perfil?erro=1");
  redirect("/painel/perfil?salvo=1");
}
