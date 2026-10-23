import Exportaciones from "../components/Exportaciones";
import TablaReporte from "../components/TablaReporte";
import type { TablaExportacion } from "../utils/exportaciones";
import { listarServicios } from "../services/servicioServices";
import { listarPerfiles } from "../services/perfilServices";
import type { Servicio } from "../types/servicio";
import type { Perfil } from "../types/perfil";
import { useEffect, useState } from "react";
import { Panel, Avisos, Etiqueta } from "../components/Controles";
import { campo, boton, secundario } from "../components/estilos";
import { listarOrdenes } from "../services/ordenServices";
import { listarVehiculos } from "../services/vehiculoServices";
import { listarUsuarios } from "../services/usuarioServices";
import type { Orden } from "../types/orden";
import type { Vehiculo } from "../types/vehiculo";
import type { Usuario } from "../types/usuario";
import { moneda, fecha, hoy, mensajeError, normalizar } from "../utils/formato";
export default function Reportes() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("");
  const [usuariosInactivos, setUsuariosInactivos] = useState(false);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [todos, setTodos] = useState(false);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
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
          setError("");
        }
      })
      .catch((e) => {
        if (vigente) setError(mensajeError(e));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [version]);
  const fechasInvalidas = Boolean(desde && hasta && desde > hasta);
  const filas = fechasInvalidas
    ? []
    : ordenes.filter(
        (o) =>
          (todos || o.estado) &&
          (!desde || o.fechaIngreso >= desde) &&
          (!hasta || o.fechaIngreso <= hasta) &&
          (!estado || o.estadoOrden === estado),
      );
  const vehiculo = (id: number) =>
    vehiculos.find((v) => v.idVehiculo === id)?.placa ?? `#${id}`;
  const usuario = (id: number) =>
    usuarios.find((u) => u.idUsuario === id)?.nombre ?? `#${id}`;
  const total =
    filas
      .filter((o) => o.estado)
      .reduce((s, o) => s + Math.round(o.total * 100), 0) / 100;
  const filtros = `Ingreso: ${desde ? fecha(desde) : "Sin límite inicial"} a ${hasta ? fecha(hasta) : "Sin límite final"} · Trabajo: ${estado.replaceAll("_", " ") || "Todos"} · ${todos ? "Activas y anuladas" : "Solo activas"}`;
  const resumen = `${filas.length} órdenes · Total de órdenes activas: ${moneda(total)}. Las anuladas no suman en este total.`;
  const tablaOrdenes: TablaExportacion = {
    titulo: "Reporte de órdenes",
    archivo: "reporte-ordenes",
    filtros,
    resumen,
    columnas: [
      "Orden",
      "Placa",
      "Propietario",
      "Responsable",
      "Ingreso",
      "Entrega",
      "Trabajo",
      "Registro",
      "Total Q",
    ].map((titulo) => ({ titulo, moneda: titulo === "Total Q" })),
    filas: filas.map((o) => [
      o.idOrden,
      vehiculo(o.idVehiculo),
      vehiculos.find((v) => v.idVehiculo === o.idVehiculo)?.propietario ??
        "Sin referencia",
      usuario(o.idUsuario),
      fecha(o.fechaIngreso),
      fecha(o.fechaEntrega),
      o.estadoOrden.replaceAll("_", " "),
      o.estado ? "Activa" : "Anulada",
      o.total,
    ]),
  };
  const tablaDetalles: TablaExportacion = {
    titulo: "Órdenes con servicios",
    archivo: "ordenes-servicios",
    filtros,
    resumen: `${resumen} El total de cada orden aparece solo en su primera fila; los detalles inactivos no suman.`,
    columnas: [
      "Orden",
      "Placa",
      "Responsable",
      "Ingreso",
      "Trabajo",
      "Registro",
      "Servicio",
      "Precio aplicado Q",
      "Observaciones",
      "Detalle",
      "Total orden Q",
    ].map((titulo) => ({ titulo, moneda: titulo.endsWith(" Q") })),
    filas: filas.flatMap((o) => {
      const cabecera = [
        o.idOrden,
        vehiculo(o.idVehiculo),
        usuario(o.idUsuario),
        fecha(o.fechaIngreso),
        o.estadoOrden.replaceAll("_", " "),
        o.estado ? "Activa" : "Anulada",
      ];
      if (!o.detalles.length)
        return [[...cabecera, "Sin detalles", null, "", "", o.total]];
      return o.detalles.map((d, i) => [
        ...cabecera,
        servicios.find((s) => s.idServicio === d.idServicio)?.nombre ??
          `Servicio #${d.idServicio}`,
        d.precioAplicado,
        d.observaciones ?? "",
        d.estado ? "Activo" : "Inactivo (no suma)",
        i === 0 ? o.total : null,
      ]);
    }),
  };
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      (usuariosInactivos || u.estado) &&
      normalizar(
        `${u.nombre} ${u.usuario} ${u.correo} ${perfiles.find((p) => p.idPerfil === u.idPerfil)?.nombre ?? ""}`,
      ).includes(normalizar(busquedaUsuarios.trim())),
  );
  const tablaUsuarios: TablaExportacion = {
    titulo: "Usuarios y perfiles",
    archivo: "usuarios-perfiles",
    filtros: `Búsqueda: ${busquedaUsuarios.trim() || "Todas"} · ${usuariosInactivos ? "Usuarios activos e inactivos" : "Solo usuarios activos"}. Se muestra el estado actual del perfil, incluso si está inactivo.`,
    columnas: [
      "Usuario ID",
      "Nombre",
      "Usuario",
      "Correo",
      "Estado usuario",
      "Perfil",
      "Estado perfil",
    ].map((titulo) => ({ titulo })),
    filas: usuariosFiltrados.map((u) => {
      const perfil = perfiles.find((p) => p.idPerfil === u.idPerfil);
      return [
        u.idUsuario,
        u.nombre,
        u.usuario,
        u.correo,
        u.estado ? "Activo" : "Inactivo",
        perfil?.nombre ?? `Perfil #${u.idPerfil}`,
        perfil ? (perfil.estado ? "Activo" : "Inactivo") : "Sin referencia",
      ];
    }),
  };
  function exportar() {
    const celda = (v: unknown) => {
      let s = String(v ?? "");
      if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replaceAll('"', '""') + '"';
    };
    const datos = [
      [
        "Orden",
        "Placa",
        "Responsable",
        "Ingreso",
        "Entrega",
        "Trabajo",
        "Registro",
        "Total Q",
      ],
      ...filas.map((o) => [
        o.idOrden,
        vehiculo(o.idVehiculo),
        usuario(o.idUsuario),
        o.fechaIngreso,
        o.fechaEntrega ?? "",
        o.estadoOrden,
        o.estado ? "Activa" : "Anulada",
        Number(o.total).toFixed(2),
      ]),
    ];
    const blob = new Blob(
      ["\uFEFF" + datos.map((f) => f.map(celda).join(";")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ordenes-${hoy()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="space-y-6">
      <Avisos error={error} mensaje="" />
      <Panel titulo="Reporte de órdenes">
        <div className="no-print mb-5 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Etiqueta id="desde" titulo="Ingreso desde">
            <input
              id="desde"
              type="date"
              className={campo}
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </Etiqueta>
          <Etiqueta id="hasta" titulo="Ingreso hasta">
            <input
              id="hasta"
              type="date"
              min={desde}
              className={campo}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </Etiqueta>
          <Etiqueta id="estado" titulo="Estado del trabajo">
            <select
              id="estado"
              className={campo}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {["PENDIENTE", "EN_PROCESO", "FINALIZADA", "ENTREGADA"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ),
              )}
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
        </div>
        {fechasInvalidas && (
          <p role="alert" className="mb-4 text-cafe">
            La fecha final debe ser igual o posterior a la inicial.
          </p>
        )}
        <p className="mb-4 text-sm">
          Período de ingreso: {desde ? fecha(desde) : "Sin límite inicial"} —{" "}
          {hasta ? fecha(hasta) : "Sin límite final"} · Trabajo:{" "}
          {estado.replaceAll("_", " ") || "Todos"} ·{" "}
          {todos ? "Activas y anuladas" : "Solo activas"}
        </p>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-crema p-4">
            <p className="text-sm">Órdenes mostradas</p>
            <strong className="text-2xl text-azul">
              {error || cargando ? "—" : filas.length}
            </strong>
          </div>
          <div className="rounded-lg bg-crema p-4">
            <p className="text-sm">Total de órdenes activas del filtro</p>
            <strong className="text-2xl text-azul">
              {error || cargando ? "—" : moneda(total)}
            </strong>
            <p className="mt-1 text-xs">
              Este importe corresponde a trabajos registrados; no representa
              cobros ni utilidades.
            </p>
          </div>
        </div>
        <Exportaciones
          tabla={tablaOrdenes}
          deshabilitado={cargando || Boolean(error) || fechasInvalidas}
        />
        <div className="no-print mb-5 flex flex-wrap gap-3">
          <button
            className={boton}
            disabled={
              cargando ||
              Boolean(error) ||
              fechasInvalidas ||
              filas.length === 0
            }
            onClick={exportar}
          >
            Descargar CSV
          </button>
          <button
            className={secundario}
            disabled={
              cargando ||
              Boolean(error) ||
              fechasInvalidas ||
              filas.length === 0
            }
            onClick={() => window.print()}
          >
            Imprimir / guardar PDF
          </button>
          <button
            className={secundario}
            disabled={cargando}
            onClick={() => {
              setCargando(true);
              setVersion((v) => v + 1);
            }}
          >
            Actualizar datos
          </button>
        </div>
        {cargando ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>No fue posible cargar los datos. Pulsa Actualizar datos.</p>
        ) : filas.length === 0 ? (
          <p className="rounded-lg bg-crema p-5 text-center">
            No hay órdenes para este filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Placa</th>
                  <th>Propietario</th>
                  <th>Responsable</th>
                  <th>Ingreso</th>
                  <th>Entrega</th>
                  <th>Trabajo</th>
                  <th>Registro</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((o) => (
                  <tr key={o.idOrden}>
                    <td>#{o.idOrden}</td>
                    <td>{vehiculo(o.idVehiculo)}</td>
                    <td>
                      {vehiculos.find((v) => v.idVehiculo === o.idVehiculo)
                        ?.propietario ?? "Sin referencia"}
                    </td>
                    <td>{usuario(o.idUsuario)}</td>
                    <td>{fecha(o.fechaIngreso)}</td>
                    <td>{fecha(o.fechaEntrega)}</td>
                    <td>{o.estadoOrden.replaceAll("_", " ")}</td>
                    <td>{o.estado ? "Activa" : "Anulada"}</td>
                    <td className="whitespace-nowrap">{moneda(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Panel titulo="Órdenes con servicios">
        <p className="mb-4 text-sm">{filtros}</p>
        <p className="mb-4 text-sm">{tablaDetalles.resumen}</p>
        <Exportaciones
          tabla={tablaDetalles}
          deshabilitado={cargando || Boolean(error) || fechasInvalidas}
        />
        {cargando ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>No fue posible cargar los datos.</p>
        ) : (
          <TablaReporte tabla={tablaDetalles} />
        )}
      </Panel>
      <Panel titulo="Usuarios y perfiles">
        <div className="no-print mb-4 flex flex-wrap items-end gap-4">
          <Etiqueta id="buscarUsuarioReporte" titulo="Buscar usuario o perfil">
            <input
              id="buscarUsuarioReporte"
              type="search"
              className={campo}
              value={busquedaUsuarios}
              onChange={(e) => setBusquedaUsuarios(e.target.value)}
            />
          </Etiqueta>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={usuariosInactivos}
              onChange={(e) => setUsuariosInactivos(e.target.checked)}
            />{" "}
            Incluir usuarios inactivos
          </label>
        </div>
        <p className="mb-4 text-sm">{tablaUsuarios.filtros}</p>
        <Exportaciones
          tabla={tablaUsuarios}
          deshabilitado={cargando || Boolean(error)}
        />
        {cargando ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>No fue posible cargar los datos.</p>
        ) : (
          <TablaReporte tabla={tablaUsuarios} />
        )}
      </Panel>
    </div>
  );
}
