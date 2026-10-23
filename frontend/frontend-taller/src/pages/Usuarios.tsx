import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Panel, Avisos, Etiqueta, Estado } from "../components/Controles";
import { campo, boton, secundario, coral } from "../components/estilos";
import { useCatalogo } from "../hooks/useCatalogo";
import { normalizar, mensajeError } from "../utils/formato";
import type { Usuario, UsuarioFormulario } from "../types/usuario";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  anularUsuario,
  activarUsuario,
} from "../services/usuarioServices";
import { listarPerfiles } from "../services/perfilServices";
import type { Perfil } from "../types/perfil";
const api = {
  listar: listarUsuarios,
  crear: crearUsuario,
  actualizar: actualizarUsuario,
  anular: anularUsuario,
  activar: activarUsuario,
};
const inicial = {
  idPerfil: "",
  nombre: "",
  usuario: "",
  correo: "",
  contrasena: "",
};
export default function Usuarios() {
  const c = useCatalogo<Usuario, UsuarioFormulario>(api, (f) => f.idUsuario);
  const [form, setForm] = useState({ ...inicial });
  const [idEdicion, setIdEdicion] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState(false);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [errorPerfiles, setErrorPerfiles] = useState("");
  const [cargandoPerfiles, setCargandoPerfiles] = useState(true);
  useEffect(() => {
    let vigente = true;
    listarPerfiles(true)
      .then((r) => {
        if (vigente) setPerfiles(r.data);
      })
      .catch((e) => {
        if (vigente) setErrorPerfiles(mensajeError(e));
      })
      .finally(() => {
        if (vigente) setCargandoPerfiles(false);
      });
    return () => {
      vigente = false;
    };
  }, []);
  function limpiar() {
    setForm({ ...inicial });
    setIdEdicion(null);
  }
  function editar(fila: Usuario) {
    setIdEdicion(fila.idUsuario);
    setForm({
      idPerfil: String(fila.idPerfil),
      nombre: String(fila.nombre),
      usuario: String(fila.usuario),
      correo: String(fila.correo),
      contrasena: "",
    });
    c.setError("");
    c.setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !perfiles.some((p) => p.idPerfil === Number(form.idPerfil) && p.estado)
    ) {
      c.setError("Selecciona un perfil activo.");
      return;
    }
    if (idEdicion === null && !form.contrasena.trim()) {
      c.setError("Ingresa una contraseña para el nuevo usuario.");
      return;
    }
    if (
      form.contrasena &&
      (form.contrasena.trim().length === 0 ||
        form.contrasena.length < 8 ||
        new TextEncoder().encode(form.contrasena).length > 72)
    ) {
      c.setError(
        "La contraseña debe tener al menos 8 caracteres y no superar 72 bytes UTF-8.",
      );
      return;
    }
    if (!form.nombre.trim() || !form.usuario.trim() || !form.correo.trim()) {
      c.setError("Completa los campos obligatorios sin usar solo espacios.");
      return;
    }
    const datos: UsuarioFormulario = {
      idPerfil: Number(form.idPerfil),
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      correo: form.correo.trim(),
      ...(form.contrasena ? { contrasena: form.contrasena } : {}),
    };
    if (await c.guardar(idEdicion, datos)) limpiar();
  }
  const filas = c.filas.filter(
    (fila) =>
      (todos || fila.estado) &&
      normalizar([fila.nombre, fila.usuario, fila.correo].join(" ")).includes(
        normalizar(busqueda.trim()),
      ),
  );
  return (
    <div className="space-y-6">
      <Avisos error={c.error} mensaje={c.mensaje} />
      <Panel
        titulo={
          idEdicion === null
            ? "Nuevo registro · Usuarios"
            : `Modificar registro #${idEdicion}`
        }
      >
        {errorPerfiles && (
          <p role="alert" className="mb-4">
            {errorPerfiles}{" "}
            <button
              className={secundario}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </p>
        )}
        {!cargandoPerfiles &&
          !errorPerfiles &&
          !perfiles.some((p) => p.estado) && (
            <p className="mb-4 rounded-lg bg-crema p-3">
              Primero registra un perfil activo en el módulo Perfiles.
            </p>
          )}
        <form onSubmit={guardar}>
          <fieldset
            disabled={
              c.ocupado ||
              c.cargando ||
              c.errorCarga ||
              cargandoPerfiles ||
              Boolean(errorPerfiles) ||
              !perfiles.some((p) => p.estado)
            }
            className="grid gap-4 disabled:opacity-60 md:grid-cols-2"
          >
            <Etiqueta id="idPerfil" titulo="Perfil">
              <select
                id="idPerfil"
                required
                className={campo}
                value={form.idPerfil}
                onChange={(e) => setForm({ ...form, idPerfil: e.target.value })}
              >
                <option value="">Selecciona un perfil</option>
                {perfiles
                  .filter(
                    (p) => p.estado || p.idPerfil === Number(form.idPerfil),
                  )
                  .map((p) => (
                    <option
                      key={p.idPerfil}
                      value={p.idPerfil}
                      disabled={!p.estado}
                    >
                      {p.nombre}
                      {p.estado ? "" : " (inactivo)"}
                    </option>
                  ))}
              </select>
            </Etiqueta>
            <Etiqueta id="nombre" titulo="Nombre">
              <input
                id="nombre"
                type="text"
                required
                maxLength={100}
                className={campo}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </Etiqueta>
            <Etiqueta id="usuario" titulo="Usuario">
              <input
                id="usuario"
                type="text"
                required
                maxLength={50}
                className={campo}
                value={form.usuario}
                onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              />
            </Etiqueta>
            <Etiqueta id="correo" titulo="Correo">
              <input
                id="correo"
                type="email"
                required
                maxLength={100}
                className={campo}
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </Etiqueta>
            <Etiqueta
              id="contrasena"
              titulo="Contraseña (omitir para conservar al editar)"
            >
              <input
                id="contrasena"
                type="password"
                required={idEdicion === null}
                maxLength={100}
                minLength={8}
                autoComplete="new-password"
                className={campo}
                value={form.contrasena}
                onChange={(e) =>
                  setForm({ ...form, contrasena: e.target.value })
                }
              />
            </Etiqueta>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button type="submit" className={boton}>
                {c.ocupado
                  ? "Guardando..."
                  : idEdicion === null
                    ? "Guardar"
                    : "Actualizar"}
              </button>
              <button
                type="button"
                className={secundario}
                onClick={() => {
                  limpiar();
                  c.setError("");
                  c.setMensaje("");
                }}
              >
                {idEdicion === null ? "Limpiar" : "Cancelar edición"}
              </button>
            </div>
          </fieldset>
        </form>
      </Panel>
      <Panel titulo="Usuarios">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div className="min-w-48 flex-1">
            <Etiqueta id="buscar" titulo="Buscar">
              <input
                id="buscar"
                type="search"
                className={campo}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Escribe para filtrar"
              />
            </Etiqueta>
          </div>
          <label className="flex items-center gap-2 py-2 text-sm">
            <input
              type="checkbox"
              checked={todos}
              onChange={(e) => setTodos(e.target.checked)}
            />{" "}
            Incluir inactivos
          </label>
          <button
            className={secundario}
            disabled={c.ocupado || c.cargando || idEdicion !== null}
            onClick={c.recargar}
          >
            Actualizar listado
          </button>
        </div>
        {c.cargando ? (
          <p>Cargando...</p>
        ) : c.errorCarga ? (
          <p role="alert">
            No fue posible cargar los registros. Pulsa Actualizar listado.
          </p>
        ) : filas.length === 0 ? (
          <p className="rounded-lg bg-crema p-5 text-center">
            No hay registros que coincidan con los filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Perfil</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.idUsuario}>
                    <td>#{fila.idUsuario}</td>
                    <td>
                      {perfiles.find((p) => p.idPerfil === fila.idPerfil)
                        ?.nombre ?? `Perfil #${fila.idPerfil}`}
                    </td>
                    <td>{fila.nombre}</td>
                    <td>{fila.usuario}</td>
                    <td>{fila.correo}</td>
                    <td>
                      <Estado activo={fila.estado} />
                    </td>
                    <td>
                      <div className="flex gap-2 whitespace-nowrap">
                        {fila.estado && (
                          <button
                            type="button"
                            className={secundario}
                            disabled={c.ocupado || idEdicion !== null}
                            onClick={() => editar(fila)}
                          >
                            Modificar
                          </button>
                        )}
                        <button
                          type="button"
                          className={fila.estado ? coral : boton}
                          disabled={c.ocupado || idEdicion !== null}
                          onClick={() => void c.cambiarEstado(fila)}
                        >
                          {fila.estado ? "Anular" : "Reactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
