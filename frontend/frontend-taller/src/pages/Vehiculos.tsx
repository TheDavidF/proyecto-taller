import { useState } from "react";
import type { FormEvent } from "react";
import { Panel, Avisos, Etiqueta, Estado } from "../components/Controles";
import { campo, boton, secundario, coral } from "../components/estilos";
import { useCatalogo } from "../hooks/useCatalogo";
import { normalizar } from "../utils/formato";
import type { Vehiculo, VehiculoFormulario } from "../types/vehiculo";
import {
  listarVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  anularVehiculo,
  activarVehiculo,
} from "../services/vehiculoServices";

const api = {
  listar: listarVehiculos,
  crear: crearVehiculo,
  actualizar: actualizarVehiculo,
  anular: anularVehiculo,
  activar: activarVehiculo,
};
const inicial = {
  placa: "",
  marca: "",
  modelo: "",
  propietario: "",
  telefonoPropietario: "",
};
export default function Vehiculos() {
  const c = useCatalogo<Vehiculo, VehiculoFormulario>(api, (f) => f.idVehiculo);
  const [form, setForm] = useState({ ...inicial });
  const [idEdicion, setIdEdicion] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState(false);

  function limpiar() {
    setForm({ ...inicial });
    setIdEdicion(null);
  }
  function editar(fila: Vehiculo) {
    setIdEdicion(fila.idVehiculo);
    setForm({
      placa: String(fila.placa),
      marca: String(fila.marca),
      modelo: String(fila.modelo),
      propietario: String(fila.propietario),
      telefonoPropietario: String(fila.telefonoPropietario),
    });
    c.setError("");
    c.setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !form.placa.trim() ||
      !form.marca.trim() ||
      !form.modelo.trim() ||
      !form.propietario.trim() ||
      !form.telefonoPropietario.trim()
    ) {
      c.setError("Completa los campos obligatorios sin usar solo espacios.");
      return;
    }
    const datos: VehiculoFormulario = {
      placa: form.placa.trim(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      propietario: form.propietario.trim(),
      telefonoPropietario: form.telefonoPropietario.trim(),
    };
    if (await c.guardar(idEdicion, datos)) limpiar();
  }
  const filas = c.filas.filter(
    (fila) =>
      (todos || fila.estado) &&
      normalizar(
        [
          fila.placa,
          fila.marca,
          fila.modelo,
          fila.propietario,
          fila.telefonoPropietario,
        ].join(" "),
      ).includes(normalizar(busqueda.trim())),
  );
  return (
    <div className="space-y-6">
      <Avisos error={c.error} mensaje={c.mensaje} />
      <Panel
        titulo={
          idEdicion === null
            ? "Nuevo registro · Vehículos"
            : `Modificar registro #${idEdicion}`
        }
      >
        <form onSubmit={guardar}>
          <fieldset
            disabled={c.ocupado || c.cargando || c.errorCarga}
            className="grid gap-4 disabled:opacity-60 md:grid-cols-2"
          >
            <Etiqueta id="placa" titulo="Placa">
              <input
                id="placa"
                type="text"
                required
                maxLength={15}
                className={campo}
                value={form.placa}
                onChange={(e) => setForm({ ...form, placa: e.target.value })}
              />
            </Etiqueta>
            <Etiqueta id="marca" titulo="Marca">
              <input
                id="marca"
                type="text"
                required
                maxLength={40}
                className={campo}
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
              />
            </Etiqueta>
            <Etiqueta id="modelo" titulo="Modelo">
              <input
                id="modelo"
                type="text"
                required
                maxLength={40}
                className={campo}
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />
            </Etiqueta>
            <Etiqueta id="propietario" titulo="Propietario">
              <input
                id="propietario"
                type="text"
                required
                maxLength={100}
                className={campo}
                value={form.propietario}
                onChange={(e) =>
                  setForm({ ...form, propietario: e.target.value })
                }
              />
            </Etiqueta>
            <Etiqueta
              id="telefonoPropietario"
              titulo="Teléfono del propietario"
            >
              <input
                id="telefonoPropietario"
                type="tel"
                required
                maxLength={20}
                className={campo}
                value={form.telefonoPropietario}
                onChange={(e) =>
                  setForm({ ...form, telefonoPropietario: e.target.value })
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
      <Panel titulo="Vehículos">
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
                  <th>Placa</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Propietario</th>
                  <th>Teléfono del propietario</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.idVehiculo}>
                    <td>#{fila.idVehiculo}</td>
                    <td>{fila.placa}</td>
                    <td>{fila.marca}</td>
                    <td>{fila.modelo}</td>
                    <td>{fila.propietario}</td>
                    <td>{fila.telefonoPropietario}</td>
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
