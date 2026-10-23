import Exportaciones from "../components/Exportaciones";
import { useState } from "react";
import type { FormEvent } from "react";
import { Panel, Avisos, Etiqueta, Estado } from "../components/Controles";
import { campo, boton, secundario, coral } from "../components/estilos";
import { useCatalogo } from "../hooks/useCatalogo";
import { normalizar } from "../utils/formato";
import type { Perfil, PerfilFormulario } from "../types/perfil";
import {
  listarPerfiles,
  crearPerfil,
  actualizarPerfil,
  anularPerfil,
  activarPerfil,
} from "../services/perfilServices";

const api = {
  listar: listarPerfiles,
  crear: crearPerfil,
  actualizar: actualizarPerfil,
  anular: anularPerfil,
  activar: activarPerfil,
};
const inicial = { nombre: "" };
export default function Perfiles() {
  const c = useCatalogo<Perfil, PerfilFormulario>(api, (f) => f.idPerfil);
  const [form, setForm] = useState({ ...inicial });
  const [idEdicion, setIdEdicion] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState(false);

  function limpiar() {
    setForm({ ...inicial });
    setIdEdicion(null);
  }
  function editar(fila: Perfil) {
    setIdEdicion(fila.idPerfil);
    setForm({ nombre: String(fila.nombre) });
    c.setError("");
    c.setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.nombre.trim()) {
      c.setError("Completa los campos obligatorios sin usar solo espacios.");
      return;
    }
    const datos: PerfilFormulario = { nombre: form.nombre.trim() };
    if (await c.guardar(idEdicion, datos)) limpiar();
  }
  const filas = c.filas.filter(
    (fila) =>
      (todos || fila.estado) &&
      normalizar([fila.nombre].join(" ")).includes(normalizar(busqueda.trim())),
  );
  return (
    <div className="space-y-6">
      <Avisos error={c.error} mensaje={c.mensaje} />
      <Panel
        titulo={
          idEdicion === null
            ? "Nuevo registro · Perfiles"
            : `Modificar registro #${idEdicion}`
        }
      >
        <form onSubmit={guardar}>
          <fieldset
            disabled={c.ocupado || c.cargando || c.errorCarga}
            className="grid gap-4 disabled:opacity-60 md:grid-cols-2"
          >
            <Etiqueta id="nombre" titulo="Nombre">
              <input
                id="nombre"
                type="text"
                required
                maxLength={80}
                className={campo}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
      <Panel titulo="Perfiles">
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
        <Exportaciones
          deshabilitado={c.cargando || c.errorCarga || c.ocupado}
          tabla={{
            titulo: "Listado de perfiles",
            archivo: "perfiles",
            filtros: `Búsqueda: ${busqueda.trim() || "Todas"} · ${todos ? "Activos e inactivos" : "Solo activos"}`,
            columnas: [
              { titulo: "ID" },
              { titulo: "Nombre" },
              { titulo: "Estado" },
            ],
            filas: filas.map((f) => [
              f.idPerfil,
              f.nombre,
              f.estado ? "Activo" : "Inactivo",
            ]),
          }}
        />
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
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.idPerfil}>
                    <td>#{fila.idPerfil}</td>
                    <td>{fila.nombre}</td>
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
