import { useState } from "react";
import type { FormEvent } from "react";
import { Avisos, Etiqueta } from "../components/Controles";
import { boton, campo } from "../components/estilos";
import { iniciarSesion } from "../services/accesoServices";
import type { Sesion } from "../services/accesoServices";
import { mensajeError } from "../utils/formato";

export default function Login({ alIngresar, aviso = "" }: { alIngresar: (sesion: Sesion) => void; aviso?: string }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function ingresar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ocupado) return;
    setError(""); setOcupado(true);
    try { alIngresar((await iniciarSesion(usuario.trim(), contrasena)).data); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(false); }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-crema px-4 py-10">
      <section className="w-full max-w-md rounded-xl border-t-4 border-coral bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-azul">Gestión del Taller</h1>
        <h2 className="mb-6 mt-2 text-lg">Iniciar sesión</h2>
        <Avisos error={error || aviso} mensaje="" />
        <form onSubmit={ingresar}>
          <fieldset disabled={ocupado} className="space-y-5 disabled:opacity-60">
            <Etiqueta id="usuario" titulo="Usuario">
              <input id="usuario" className={campo} autoComplete="username" required maxLength={50}
                value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </Etiqueta>
            <Etiqueta id="contrasena" titulo="Contraseña">
              <input id="contrasena" className={campo} type="password" autoComplete="current-password" required
                value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
            </Etiqueta>
            <button className={`${boton} w-full`} type="submit">{ocupado ? "Ingresando..." : "Ingresar"}</button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
