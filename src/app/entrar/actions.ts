"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function campos(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function entrar(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(campos(formData));
  if (error) redirect("/entrar?erro=login");
  redirect("/painel");
}

export async function cadastrar(formData: FormData) {
  const { email, password } = campos(formData);
  if (password.length < 8) redirect("/entrar?modo=cadastro&erro=senha");

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) redirect("/entrar?modo=cadastro&erro=cadastro");

  // Com confirmação de e-mail ligada, o Supabase não devolve sessão ainda.
  if (!data.session) redirect("/entrar?aviso=confirme");
  redirect("/painel");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
