import type { SupabaseClient } from "@supabase/supabase-js";

export const REDES = ["Instagram", "Facebook", "TikTok", "YouTube", "LinkedIn"];

export type Perfil = {
  nome_marca: string;
  nicho: string;
  publico: string;
  tom: string;
  redes: string[];
  cores: string;
  exemplos: string;
};

export const perfilVazio: Perfil = {
  nome_marca: "",
  nicho: "",
  publico: "",
  tom: "",
  redes: [],
  cores: "",
  exemplos: "",
};

export async function buscarPerfil(
  supabase: SupabaseClient,
  userId: string,
): Promise<Perfil | null> {
  const { data } = await supabase
    .from("brand_profiles")
    .select("nome_marca, nicho, publico, tom, redes, cores, exemplos")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// O perfil está pronto quando tem o mínimo para o agente trabalhar.
export function perfilCompleto(perfil: Perfil | null): perfil is Perfil {
  return Boolean(perfil && perfil.nicho && perfil.publico && perfil.tom);
}

export function perfilComoTexto(perfil: Perfil): string {
  return [
    `Marca: ${perfil.nome_marca || "(sem nome)"}`,
    `Nicho: ${perfil.nicho}`,
    `Público: ${perfil.publico}`,
    `Tom de voz: ${perfil.tom}`,
    `Redes: ${perfil.redes.join(", ") || "não informado"}`,
    `Cores: ${perfil.cores || "não informado"}`,
    perfil.exemplos ? `Exemplos de posts da marca:\n${perfil.exemplos}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
