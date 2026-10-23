import Exportaciones from "../components/Exportaciones";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Panel, Avisos, Etiqueta, Estado } from "../components/Controles";
import { campo, boton, secundario, coral } from "../components/estilos";
import {
  crearOrden,
  listarOrdenes,
  actualizarOrden,
  anularOrden,
  activarOrden,
} from "../services/ordenServices";
import { listarVehiculos } from "../services/vehiculoServices";
import { listarUsuarios } from "../services/usuarioServices";
import { listarServicios } from "../services/servicioServices";
import { listarPerfiles } from "../services/perfilServices";
import type { Orden, OrdenFormulario, EstadoOrden } from "../types/orden";
import type { Vehiculo } from "../types/vehiculo";
import type { Usuario } from "../types/usuario";
import type { Servicio } from "../types/servicio";
import type { Perfil } from "../types/perfil";
import { moneda, fecha, hoy, mensajeError, normalizar } from "../utils/formato";
const estados: EstadoOrden[] = [
  "PENDIENTE",
  "EN_PROCESO",
  "FINALIZADA",
  "ENTREGADA",
];
const inicial = (): OrdenFormulario => ({
  idVehiculo: 0,
  idUsuario: 0,
  fechaIngreso: hoy(),
  fechaEntrega: null,
  estadoOrden: "PENDIENTE",
  detalles: [],
});
export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [form, setForm] = useState<OrdenFormulario>(inicial);
  const [idEdicion, setIdEdicion] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<Orden | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [version, setVersion] = useState(0);
  const candado = useRef(false);
  useEffect(() => {
    let vigente = true;
    Promise.all([
      listarOrdenes(true),
      listarVehiculos(true),
      listarUsuarios(true),
      listarServicios(true),
      listarPerfiles(true),
    ])
      .then(([o, v, u, s, p]) => {
        if (vigente) {
          setOrdenes(o.data);
          setVehiculos(v.data);
          setUsuarios(u.data);
          setServicios(s.data);
          setPerfiles(p.data);
          setErrorCarga(false);
          setError("");
        }
      })
      .catch((e) => {
        if (vigente) {
          setError(mensajeError(e));
          setErrorCarga(true);
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [version]);
  const vehiculoTexto = (id: number) => {
    const v = vehiculos.find((v) => v.idVehiculo === id);
    return v ? `${v.placa} · ${v.marca} ${v.modelo}` : `Vehículo #${id}`;
  };
  const usuarioTexto = (id: number) =>
    usuarios.find((u) => u.idUsuario === id)?.nombre ?? `Usuario #${id}`;
  const servicioTexto = (id: number) =>
    servicios.find((s) => s.idServicio === id)?.nombre ?? `Servicio #${id}`;
  const usuarioActivo = (u: Usuario) =>
    u.estado && perfiles.some((p) => p.idPerfil === u.idPerfil && p.estado);
  const faltanCatalogos =
    !vehiculos.some((v) => v.estado) ||
    !usuarios.some(usuarioActivo) ||
    !servicios.some((s) => s.estado);
  const totalCentavos = form.detalles.reduce(
    (s, d) => s + (d.estado ? Math.round(Number(d.precioAplicado) * 100) : 0),
    0,
  );
  function limpiar() {
    setForm(inicial());
    setIdEdicion(null);
    setDetalle(null);
  }
  function recargar() {
    setCargando(true);
    setVersion((v) => v + 1);
    setDetalle(null);
  }
  function editar(orden: Orden) {
    if (ocupado || !orden.estado) return;
    setIdEdicion(orden.idOrden);
    setDetalle(null);
    setError("");
    setMensaje("");
    setForm({
      idVehiculo: orden.idVehiculo,
      idUsuario: orden.idUsuario,
      fechaIngreso: orden.fechaIngreso,
      fechaEntrega: orden.fechaEntrega,
      estadoOrden: orden.estadoOrden,
      detalles: orden.detalles.map((d) => ({
        idDetalleOrden: d.idDetalleOrden,
        idServicio: d.idServicio,
        precioAplicado: d.precioAplicado,
        observaciones: d.observaciones ?? "",
        estado: d.estado,
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function agregarDetalle() {
    setForm((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        { idServicio: 0, precioAplicado: 0, observaciones: "", estado: true },
      ],
    }));
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (candado.current || errorCarga) return;
    setError("");
    setMensaje("");
    if (
      !vehiculos.some((v) => v.idVehiculo === form.idVehiculo && v.estado) ||
      !usuarios.some((u) => u.idUsuario === form.idUsuario && usuarioActivo(u))
    ) {
      setError(
        "Selecciona un vehículo y un responsable activos, con perfil activo.",
      );
      return;
    }
    if (
      !form.fechaIngreso ||
      (form.fechaEntrega && form.fechaEntrega < form.fechaIngreso)
    ) {
      setError(
        "Revisa las fechas: la entrega no puede ser anterior al ingreso.",
      );
      return;
    }
    if (!form.detalles.some((d) => d.estado)) {
      setError("La orden necesita al menos un servicio activo.");
      return;
    }
    if (
      form.detalles.some(
        (d) =>
          !servicios.some((s) => s.idServicio === d.idServicio && s.estado) ||
          !Number.isFinite(Number(d.precioAplicado)) ||
          Number(d.precioAplicado) < 0 ||
          !/^\d+(\.\d{1,2})?$/.test(String(d.precioAplicado)) ||
          Number(d.precioAplicado) > 99999999.99,
      )
    ) {
      setError(
        "Cada detalle necesita un servicio activo y un precio válido con hasta dos decimales.",
      );
      return;
    }
    if (totalCentavos > 9999999999) {
      setError("El total supera el límite permitido.");
      return;
    }
    candado.current = true;
    setOcupado(true);
    try {
      const datos = {
        ...form,
        detalles: form.detalles.map((d) => ({
          ...d,
          precioAplicado: Number(d.precioAplicado),
          observaciones: d.observaciones.trim(),
        })),
      };
      const r =
        idEdicion === null
          ? await crearOrden(datos)
          : await actualizarOrden(idEdicion, datos);
      setOrdenes((prev) =>
        idEdicion === null
          ? [r.data, ...prev]
          : prev.map((o) => (o.idOrden === idEdicion ? r.data : o)),
      );
      setMensaje(
        `Orden #${r.data.idOrden} ${idEdicion === null ? "creada" : "actualizada"} correctamente.`,
      );
      limpiar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      candado.current = false;
      setOcupado(false);
    }
  }
  async function cambiarEstado(orden: Orden) {
    if (candado.current || idEdicion !== null) return;
    if (
      !window.confirm(
        `¿Deseas ${orden.estado ? "anular" : "reactivar"} la orden #${orden.idOrden}?`,
      )
    )
      return;
    candado.current = true;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      let nueva: Orden;
      if (orden.estado) {
        await anularOrden(orden.idOrden);
        nueva = { ...orden, estado: false };
      } else nueva = (await activarOrden(orden.idOrden)).data;
      setOrdenes((prev) =>
        prev.map((o) => (o.idOrden === orden.idOrden ? nueva : o)),
      );
      setDetalle(null);
      setMensaje(
        `Orden #${orden.idOrden} ${orden.estado ? "anulada" : "reactivada"} correctamente.`,
      );
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      candado.current = false;
      setOcupado(false);
    }
  }
  const filas = ordenes.filter(
    (o) =>
      (todos || o.estado) &&
      (!filtroEstado || o.estadoOrden === filtroEstado) &&
      normalizar(
        `${o.idOrden} ${vehiculoTexto(o.idVehiculo)} ${usuarioTexto(o.idUsuario)} ${o.estadoOrden.replaceAll("_", " ")}`,
      ).includes(normalizar(busqueda.trim())),
  );
  return (
    <div className="space-y-6">
      <Avisos error={error} mensaje={mensaje} />
      <Panel
        titulo={
          idEdicion === null
            ? "Nueva orden de servicio"
            : `Modificar orden #${idEdicion}`
        }
      >
        {!cargando && !errorCarga && faltanCatalogos && (
          <p className="mb-4 rounded-lg bg-crema p-3">
            No hay suficientes registros activos para crear una orden.
          </p>
        )}
        <form onSubmit={guardar}>
          <fieldset
            disabled={
              ocupado ||
              cargando ||
              errorCarga ||
              (faltanCatalogos && idEdicion === null)
            }
            className="space-y-5 disabled:opacity-60"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Etiqueta id="vehiculo" titulo="Vehículo">
                <select
                  id="vehiculo"
                  className={campo}
                  required
                  value={form.idVehiculo || ""}
                  onChange={(e) =>
                    setForm({ ...form, idVehiculo: Number(e.target.value) })
                  }
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehiculos
                    .filter((v) => v.estado || v.idVehiculo === form.idVehiculo)
                    .map((v) => (
                      <option
                        key={v.idVehiculo}
                        value={v.idVehiculo}
                        disabled={!v.estado}
                      >
                        {v.placa} · {v.propietario}
                        {!v.estado ? " (inactivo)" : ""}
                      </option>
                    ))}
                </select>
              </Etiqueta>
              <Etiqueta id="responsable" titulo="Responsable">
                <select
                  id="responsable"
                  className={campo}
                  required
                  value={form.idUsuario || ""}
                  onChange={(e) =>
                    setForm({ ...form, idUsuario: Number(e.target.value) })
                  }
                >
                  <option value="">Selecciona un responsable</option>
                  {usuarios
                    .filter(
                      (u) => usuarioActivo(u) || u.idUsuario === form.idUsuario,
                    )
                    .map((u) => (
                      <option
                        key={u.idUsuario}
                        value={u.idUsuario}
                        disabled={!usuarioActivo(u)}
                      >
                        {u.nombre}
                        {!usuarioActivo(u)
                          ? " (usuario o perfil inactivo)"
                          : ""}
                      </option>
                    ))}
                </select>
              </Etiqueta>
              <Etiqueta id="ingreso" titulo="Fecha de ingreso">
                <input
                  id="ingreso"
                  type="date"
                  required
                  className={campo}
                  value={form.fechaIngreso}
                  onChange={(e) =>
                    setForm({ ...form, fechaIngreso: e.target.value })
                  }
                />
              </Etiqueta>
              <Etiqueta id="entrega" titulo="Fecha de entrega (opcional)">
                <input
                  id="entrega"
                  type="date"
                  min={form.fechaIngreso}
                  className={campo}
                  value={form.fechaEntrega ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, fechaEntrega: e.target.value || null })
                  }
                />
              </Etiqueta>
              <Etiqueta id="estadoTrabajo" titulo="Estado del trabajo">
                <select
                  id="estadoTrabajo"
                  className={campo}
                  value={form.estadoOrden}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estadoOrden: e.target.value as EstadoOrden,
                    })
                  }
                >
                  {estados.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-azul">Servicios de la orden</h3>
              <button
                type="button"
                className={secundario}
                onClick={agregarDetalle}
              >
                + Agregar servicio
              </button>
            </div>
            {form.detalles.length === 0 && (
              <p className="rounded-lg bg-crema p-4 text-sm">
                Sin servicios agregados.
              </p>
            )}
            {form.detalles.map((d, i) => (
              <div
                key={
                  d.idDetalleOrden
                    ? `existente-${d.idDetalleOrden}`
                    : `nuevo-${i}`
                }
                className="grid gap-3 rounded-lg border border-cafe/15 bg-crema/30 p-4 md:grid-cols-2"
              >
                <Etiqueta id={`servicio-${i}`} titulo={`Servicio ${i + 1}`}>
                  <select
                    id={`servicio-${i}`}
                    required
                    className={campo}
                    value={d.idServicio || ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const s = servicios.find((s) => s.idServicio === id);
                      setForm((prev) => ({
                        ...prev,
                        detalles: prev.detalles.map((item, j) =>
                          j === i
                            ? {
                                ...item,
                                idServicio: id,
                                precioAplicado: s?.precioBase ?? 0,
                              }
                            : item,
                        ),
                      }));
                    }}
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios
                      .filter((s) => s.estado || s.idServicio === d.idServicio)
                      .map((s) => (
                        <option
                          key={s.idServicio}
                          value={s.idServicio}
                          disabled={!s.estado}
                        >
                          {s.nombre}
                          {!s.estado ? " (inactivo)" : ""}
                        </option>
                      ))}
                  </select>
                </Etiqueta>
                <Etiqueta id={`precio-${i}`} titulo="Precio aplicado (Q)">
                  <input
                    id={`precio-${i}`}
                    type="number"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    required
                    className={campo}
                    value={
                      Number.isNaN(d.precioAplicado) ? "" : d.precioAplicado
                    }
                    onChange={(e) => {
                      const valor =
                        e.target.value === "" ? NaN : Number(e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        detalles: prev.detalles.map((item, j) =>
                          j === i ? { ...item, precioAplicado: valor } : item,
                        ),
                      }));
                    }}
                  />
                </Etiqueta>
                <Etiqueta id={`observacion-${i}`} titulo="Observaciones">
                  <textarea
                    id={`observacion-${i}`}
                    rows={2}
                    maxLength={200}
                    className={campo}
                    value={d.observaciones}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        detalles: prev.detalles.map((item, j) =>
                          j === i ? { ...item, observaciones: valor } : item,
                        ),
                      }));
                    }}
                  />
                </Etiqueta>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={d.estado}
                      onChange={(e) => {
                        const valor = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          detalles: prev.detalles.map((item, j) =>
                            j === i ? { ...item, estado: valor } : item,
                          ),
                        }));
                      }}
                    />{" "}
                    Incluir en el total
                  </label>
                  <button
                    type="button"
                    className={coral}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        detalles: prev.detalles.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cafe/15 pt-4">
              <p className="text-xl font-bold text-azul">
                Total:{" "}
                {Number.isFinite(totalCentavos)
                  ? moneda(totalCentavos / 100)
                  : "Revisa los precios"}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={secundario}
                  onClick={() => {
                    limpiar();
                    setError("");
                    setMensaje("");
                  }}
                >
                  {idEdicion === null ? "Limpiar" : "Cancelar edición"}
                </button>
                <button type="submit" className={boton}>
                  {ocupado
                    ? "Guardando..."
                    : idEdicion === null
                      ? "Guardar orden"
                      : "Actualizar orden"}
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </Panel>
      <Panel titulo="Órdenes registradas">
        <div className="no-print mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Etiqueta id="buscarOrden" titulo="Buscar">
              <input
                id="buscarOrden"
                type="search"
                className={campo}
                placeholder="Número, placa o responsable"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Etiqueta>
          </div>
          <Etiqueta id="filtroEstado" titulo="Estado del trabajo">
            <select
              id="filtroEstado"
              className={campo}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {estados.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </Etiqueta>
          <label className="flex items-center gap-2 py-2 text-sm">
            <input
              type="checkbox"
              checked={todos}
              onChange={(e) => setTodos(e.target.checked)}
            />{" "}
            Incluir anuladas
          </label>
          <button
            type="button"
            className={secundario}
            disabled={ocupado || cargando || idEdicion !== null}
            onClick={recargar}
          >
            Actualizar datos
          </button>
        </div>
        <Exportaciones
          deshabilitado={cargando || errorCarga || ocupado}
          tabla={{
            titulo: "Listado de Órdenes",
            archivo: "ordenes",
            filtros: `Búsqueda: ${busqueda.trim() || "Todas"} · Trabajo: ${filtroEstado.replaceAll("_", " ") || "Todos"} · ${todos ? "Activas y anuladas" : "Solo activas"}`,
            columnas: [
              { titulo: "Orden" },
              { titulo: "Vehículo" },
              { titulo: "Responsable" },
              { titulo: "Ingreso" },
              { titulo: "Entrega" },
              { titulo: "Trabajo" },
              { titulo: "Registro" },
              { titulo: "Total Q", moneda: true },
            ],
            filas: filas.map((f) => [
              f.idOrden,
              vehiculoTexto(f.idVehiculo),
              usuarioTexto(f.idUsuario),
              fecha(f.fechaIngreso),
              fecha(f.fechaEntrega),
              f.estadoOrden.replaceAll("_", " "),
              f.estado ? "Activa" : "Anulada",
              f.total,
            ]),
          }}
        />
        {cargando ? (
          <p>Cargando...</p>
        ) : errorCarga ? (
          <p>
            No se pudo cargar el listado. Pulsa Actualizar datos para
            reintentar.
          </p>
        ) : filas.length === 0 ? (
          <p className="rounded-lg bg-crema p-5 text-center">
            No hay órdenes que coincidan con los filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Vehículo</th>
                  <th>Responsable</th>
                  <th>Ingreso</th>
                  <th>Entrega</th>
                  <th>Trabajo</th>
                  <th>Total</th>
                  <th className="no-print">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((o) => (
                  <tr key={o.idOrden}>
                    <td>
                      <strong>#{o.idOrden}</strong>
                      {!o.estado && (
                        <span className="block text-xs">Anulada</span>
                      )}
                    </td>
                    <td>{vehiculoTexto(o.idVehiculo)}</td>
                    <td>{usuarioTexto(o.idUsuario)}</td>
                    <td className="whitespace-nowrap">
                      {fecha(o.fechaIngreso)}
                    </td>
                    <td className="whitespace-nowrap">
                      {fecha(o.fechaEntrega)}
                    </td>
                    <td className="whitespace-nowrap">
                      {o.estadoOrden.replaceAll("_", " ")}
                    </td>
                    <td className="whitespace-nowrap font-semibold">
                      {moneda(o.total)}
                    </td>
                    <td className="no-print">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button
                          className={secundario}
                          disabled={ocupado}
                          onClick={() => setDetalle(o)}
                        >
                          Ver detalle
                        </button>
                        {o.estado && (
                          <button
                            className={boton}
                            disabled={ocupado || idEdicion !== null}
                            onClick={() => editar(o)}
                          >
                            Modificar
                          </button>
                        )}
                        <button
                          className={o.estado ? coral : boton}
                          disabled={ocupado || idEdicion !== null}
                          onClick={() => void cambiarEstado(o)}
                        >
                          {o.estado ? "Anular" : "Reactivar"}
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
      {detalle && (
        <Panel titulo={`Detalle de orden #${detalle.idOrden}`}>
          <div className="no-print mb-4">
            <button className={secundario} onClick={() => setDetalle(null)}>
              Cerrar detalle
            </button>
          </div>
          <dl className="mb-5 grid gap-4 rounded-lg bg-crema p-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm">Vehículo</dt>
              <dd className="font-bold">{vehiculoTexto(detalle.idVehiculo)}</dd>
            </div>
            <div>
              <dt className="text-sm">Responsable</dt>
              <dd className="font-bold">{usuarioTexto(detalle.idUsuario)}</dd>
            </div>
            <div>
              <dt>Ingreso / Entrega</dt>
              <dd>
                {fecha(detalle.fechaIngreso)} / {fecha(detalle.fechaEntrega)}
              </dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>
                {detalle.estadoOrden.replaceAll("_", " ")} ·{" "}
                <Estado activo={detalle.estado} />
              </dd>
            </div>
          </dl>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Observaciones</th>
                  <th>Activo</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {detalle.detalles.map((d) => (
                  <tr key={d.idDetalleOrden}>
                    <td>{servicioTexto(d.idServicio)}</td>
                    <td className="whitespace-pre-wrap break-words">
                      {d.observaciones || "Sin observaciones"}
                    </td>
                    <td>{d.estado ? "Sí" : "No"}</td>
                    <td className="whitespace-nowrap">
                      {moneda(d.precioAplicado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-right text-xl font-bold text-azul">
            Total: {moneda(detalle.total)}
          </p>
        </Panel>
      )}
    </div>
  );
}
