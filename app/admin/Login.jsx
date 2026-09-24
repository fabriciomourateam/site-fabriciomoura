"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function Login() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="adm adm--login">
      <form action={action} className="adm-card">
        <h1>Editar site</h1>
        <label>Senha<input type="password" name="senha" autoComplete="current-password" required autoFocus /></label>
        {state?.erro && <p className="adm-erro" role="alert">{state.erro}</p>}
        <button className="adm-btn" disabled={pending}>{pending ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
