import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import {
  crearOrden,
  listarOrdenes,
  actualizarOrden,
  anularOrden,
} from "../services/ordenServices";

import {
  listarVehiculosOrden,
  listarUsuariosOrden,
  listarServiciosOrden,
} from "../services/catalogosOrdenServices";

import type {
  Orden,
  OrdenFormulario,
  EstadoOrden,
  DetalleOrdenFormulario,
} from "../types/orden";

import type {
  VehiculoOrden,
  UsuarioOrden,
  ServicioOrden,
} from "../types/catalogosOrden";

function fechaActual() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function formularioInicial(): OrdenFormulario {
  return {
    idVehiculo: 0,
    idUsuario: 0,
    fechaIngreso: fechaActual(),
    fechaEntrega: null,
    estadoOrden: "PENDIENTE",
    detalles: [],
  };
}

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const datos = error.response?.data;

    if (datos?.errores && typeof datos.errores === "object") {
      const mensajes = Object.entries(datos.errores)
        .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
        .join(". ");

      if (mensajes) return mensajes;
    }

    return (
      datos?.mensaje ??
      "No fue posible conectar con el backend."
    );
  }

  return "Ocurrió un error inesperado.";
}

function formatoMoneda(valor: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(valor);
}

function formatoFecha(fecha: string | null) {
  if (!fecha) return "Sin definir";

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

const claseCampo =
  "w-full rounded-lg border border-cafe/25 bg-white px-3 py-2 " +
  "text-cafe outline-none focus:border-azul focus:ring-2 focus:ring-azul/20";

const claseBotonAzul =
  "rounded-lg bg-azul px-4 py-2 font-semibold text-white " +
  "transition hover:bg-azul/90 disabled:cursor-not-allowed disabled:opacity-50";

const claseBotonCoral =
  "rounded-lg bg-coral px-4 py-2 font-semibold text-cafe " +
  "transition hover:bg-coral/80 disabled:cursor-not-allowed disabled:opacity-50";

const claseBotonSecundario =
  "rounded-lg border border-azul px-4 py-2 font-semibold text-azul " +
  "transition hover:bg-azul/10 disabled:cursor-not-allowed disabled:opacity-50";

function Ordenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoOrden[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioOrden[]>([]);
  const [servicios, setServicios] = useState<ServicioOrden[]>([]);

  const [form, setForm] = useState<OrdenFormulario>(
    formularioInicial,
  );

  const [idEdicion, setIdEdicion] = useState<number | null>(null);
  const [idAnulando, setIdAnulando] = useState<number | null>(null);
  const [ordenDetalle, setOrdenDetalle] = useState<Orden | null>(null);

  const [idServicio, setIdServicio] = useState(0);
  const [precioAplicado, setPrecioAplicado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [
          respuestaOrdenes,
          respuestaVehiculos,
          respuestaUsuarios,
          respuestaServicios,
        ] = await Promise.all([
          listarOrdenes(),
          listarVehiculosOrden(),
          listarUsuariosOrden(),
          listarServiciosOrden(),
        ]);

        if (!activo) return;

        setOrdenes(respuestaOrdenes.data);
        setVehiculos(respuestaVehiculos.data);
        setUsuarios(respuestaUsuarios.data);
        setServicios(respuestaServicios.data);
      } catch (error: unknown) {
        if (activo) setError(obtenerMensajeError(error));
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const ocupado = guardando || idAnulando !== null;

  const faltanCatalogos =
    vehiculos.length === 0 ||
    usuarios.length === 0 ||
    servicios.length === 0;

  const obtenerVehiculo = (id: number) => {
    const vehiculo = vehiculos.find(
      (elemento) => elemento.idVehiculo === id,
    );

    return vehiculo
      ? `${vehiculo.placa} · ${vehiculo.marca} ${vehiculo.modelo}`
      : `Vehículo #${id}`;
  };

  const obtenerUsuario = (id: number) =>
    usuarios.find((elemento) => elemento.idUsuario === id)
      ?.nombre ?? `Usuario #${id}`;

  const obtenerServicio = (id: number) =>
    servicios.find((elemento) => elemento.idServicio === id)
      ?.nombre ?? `Servicio #${id}`;

  const limpiarFormulario = () => {
    setForm(formularioInicial());
    setIdEdicion(null);
    setIdServicio(0);
    setPrecioAplicado("");
    setObservaciones("");
    setOrdenDetalle(null);
  };

  const seleccionarServicio = (id: number) => {
    setIdServicio(id);

    const servicio = servicios.find(
      (elemento) => elemento.idServicio === id,
    );

    setPrecioAplicado(
      servicio ? String(servicio.precioBase) : "",
    );
  };

  const agregarServicio = () => {
    if (ocupado) return;

    setError("");
    setMensaje("");

    const servicio = servicios.find(
      (elemento) => elemento.idServicio === idServicio,
    );

    if (!servicio) {
      setError("Selecciona un servicio.");
      return;
    }

    const precio = Number(precioAplicado);

    if (
      precioAplicado.trim() === "" ||
      !Number.isFinite(precio) ||
      precio < 0 ||
      precio > 99999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(precioAplicado)
    ) {
      setError(
        "Ingresa un precio válido, con un máximo de dos decimales.",
      );
      return;
    }

    const detalle: DetalleOrdenFormulario = {
      idServicio,
      precioAplicado: precio,
      observaciones: observaciones.trim(),
      estado: true,
    };

    setForm((anterior) => ({
      ...anterior,
      detalles: [...anterior.detalles, detalle],
    }));

    setIdServicio(0);
    setPrecioAplicado("");
    setObservaciones("");
  };

  const quitarServicio = (indice: number) => {
    if (ocupado) return;

    setForm((anterior) => ({
      ...anterior,
      detalles: anterior.detalles.filter(
        (_, posicion) => posicion !== indice,
      ),
    }));
  };

  const totalCentavos = form.detalles.reduce(
    (total, detalle) =>
      detalle.estado
        ? total + Math.round(detalle.precioAplicado * 100)
        : total,
    0,
  );

  const modificarOrden = (orden: Orden) => {
    if (ocupado) return;

    const vehiculoDisponible = vehiculos.some(
      (elemento) => elemento.idVehiculo === orden.idVehiculo,
    );

    const usuarioDisponible = usuarios.some(
      (elemento) => elemento.idUsuario === orden.idUsuario,
    );

    const serviciosDisponibles = orden.detalles.every(
      (detalle) =>
        servicios.some(
          (servicio) =>
            servicio.idServicio === detalle.idServicio,
        ),
    );

    if (
      !vehiculoDisponible ||
      !usuarioDisponible ||
      !serviciosDisponibles
    ) {
      setMensaje("");
      setError(
        "Esta orden tiene un vehículo, usuario o servicio que ya no está activo. Reactívalo desde su módulo antes de editarla.",
      );
      return;
    }

    setIdEdicion(orden.idOrden);
    setOrdenDetalle(null);

    setForm({
      idVehiculo: orden.idVehiculo,
      idUsuario: orden.idUsuario,
      fechaIngreso: orden.fechaIngreso,
      fechaEntrega: orden.fechaEntrega,
      estadoOrden: orden.estadoOrden,
      detalles: orden.detalles.map((detalle) => ({
        idDetalleOrden: detalle.idDetalleOrden,
        idServicio: detalle.idServicio,
        precioAplicado: detalle.precioAplicado,
        observaciones: detalle.observaciones ?? "",
        estado: detalle.estado,
      })),
    });

    setIdServicio(0);
    setPrecioAplicado("");
    setObservaciones("");
    setError("");
    setMensaje("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardarOrden = async (
    evento: FormEvent<HTMLFormElement>,
  ) => {
    evento.preventDefault();

    if (ocupado) return;

    setError("");
    setMensaje("");

    if (!form.idVehiculo || !form.idUsuario) {
      setError("Selecciona un vehículo y un responsable.");
      return;
    }

    if (!form.fechaIngreso) {
      setError("Selecciona la fecha de ingreso.");
      return;
    }

    if (!form.detalles.some((detalle) => detalle.estado)) {
      setError("Agrega al menos un servicio activo a la orden.");
      return;
    }

    if (
      form.fechaEntrega &&
      form.fechaEntrega < form.fechaIngreso
    ) {
      setError(
        "La fecha de entrega no puede ser anterior al ingreso.",
      );
      return;
    }

    if (totalCentavos > 9999999999) {
      setError("El total supera el límite permitido.");
      return;
    }

    if (idServicio !== 0) {
      setError(
        'Hay un servicio seleccionado sin agregar. Pulsa "Agregar servicio".',
      );
      return;
    }

    setGuardando(true);

    try {
      if (idEdicion !== null) {
        const respuesta = await actualizarOrden(idEdicion, form);

        setOrdenes((anteriores) =>
          anteriores.map((orden) =>
            orden.idOrden === idEdicion
              ? respuesta.data
              : orden,
          ),
        );

        setMensaje(
          `Orden #${idEdicion} actualizada correctamente.`,
        );
      } else {
        const respuesta = await crearOrden(form);

        setOrdenes((anteriores) => [
          respuesta.data,
          ...anteriores,
        ]);

        setMensaje(
          `Orden #${respuesta.data.idOrden} creada correctamente.`,
        );
      }

      limpiarFormulario();
    } catch (error: unknown) {
      setError(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarAnulacion = async (orden: Orden) => {
    if (ocupado) return;

    const confirmar = window.confirm(
      `¿Deseas anular la orden #${orden.idOrden}?`,
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");
    setIdAnulando(orden.idOrden);

    try {
      await anularOrden(orden.idOrden);

      setOrdenes((anteriores) =>
        anteriores.filter(
          (elemento) => elemento.idOrden !== orden.idOrden,
        ),
      );

      setOrdenDetalle(null);

      if (idEdicion === orden.idOrden) {
        limpiarFormulario();
      }

      setMensaje(
        `Orden #${orden.idOrden} anulada correctamente.`,
      );
    } catch (error: unknown) {
      setError(obtenerMensajeError(error));
    } finally {
      setIdAnulando(null);
    }
  };

  const textoBusqueda = busqueda.trim().toLowerCase();

  const ordenesFiltradas = ordenes.filter((orden) => {
    const texto = [
      orden.idOrden,
      obtenerVehiculo(orden.idVehiculo),
      obtenerUsuario(orden.idUsuario),
      orden.estadoOrden.replaceAll("_", " "),
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(textoBusqueda);
  });

  if (cargando) {
    return (
      <p className="py-8 text-center">
        Cargando órdenes y catálogos...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-coral bg-white p-4 text-cafe"
        >
          {error}
        </p>
      )}

      {mensaje && (
        <p
          role="status"
          className="rounded-lg border border-azul bg-white p-4 text-azul"
        >
          {mensaje}
        </p>
      )}

      <section className="rounded-xl border border-cafe/10 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-azul">
          {idEdicion !== null
            ? `Modificar orden #${idEdicion}`
            : "Nueva orden de servicio"}
        </h2>

        {faltanCatalogos && (
          <p className="mt-4 rounded-lg bg-crema p-3 text-sm">
            Para crear órdenes necesitas vehículos, usuarios
            y servicios activos registrados en el sistema.
          </p>
        )}

        <form onSubmit={guardarOrden} className="mt-5">
          <fieldset
            disabled={ocupado || faltanCatalogos}
            className="space-y-5 disabled:opacity-60"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="vehiculo"
                  className="mb-1 block font-semibold"
                >
                  Vehículo
                </label>

                <select
                  id="vehiculo"
                  required
                  value={form.idVehiculo || ""}
                  onChange={(evento) =>
                    setForm({
                      ...form,
                      idVehiculo: Number(evento.target.value),
                    })
                  }
                  className={claseCampo}
                >
                  <option value="">
                    Selecciona un vehículo
                  </option>

                  {vehiculos.map((vehiculo) => (
                    <option
                      key={vehiculo.idVehiculo}
                      value={vehiculo.idVehiculo}
                    >
                      {vehiculo.placa} · {vehiculo.propietario}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="usuario"
                  className="mb-1 block font-semibold"
                >
                  Responsable
                </label>

                <select
                  id="usuario"
                  required
                  value={form.idUsuario || ""}
                  onChange={(evento) =>
                    setForm({
                      ...form,
                      idUsuario: Number(evento.target.value),
                    })
                  }
                  className={claseCampo}
                >
                  <option value="">
                    Selecciona un responsable
                  </option>

                  {usuarios.map((usuario) => (
                    <option
                      key={usuario.idUsuario}
                      value={usuario.idUsuario}
                    >
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="fechaIngreso"
                  className="mb-1 block font-semibold"
                >
                  Fecha de ingreso
                </label>

                <input
                  id="fechaIngreso"
                  type="date"
                  required
                  value={form.fechaIngreso}
                  onChange={(evento) =>
                    setForm({
                      ...form,
                      fechaIngreso: evento.target.value,
                    })
                  }
                  className={claseCampo}
                />
              </div>

              <div>
                <label
                  htmlFor="fechaEntrega"
                  className="mb-1 block font-semibold"
                >
                  Fecha de entrega
                </label>

                <input
                  id="fechaEntrega"
                  type="date"
                  min={form.fechaIngreso}
                  value={form.fechaEntrega ?? ""}
                  onChange={(evento) =>
                    setForm({
                      ...form,
                      fechaEntrega:
                        evento.target.value || null,
                    })
                  }
                  className={claseCampo}
                />
              </div>

              <div>
                <label
                  htmlFor="estadoOrden"
                  className="mb-1 block font-semibold"
                >
                  Estado del trabajo
                </label>

                <select
                  id="estadoOrden"
                  value={form.estadoOrden}
                  onChange={(evento) =>
                    setForm({
                      ...form,
                      estadoOrden:
                        evento.target.value as EstadoOrden,
                    })
                  }
                  className={claseCampo}
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En proceso</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="ENTREGADA">Entregada</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-cafe/15 bg-crema/40 p-4">
              <h3 className="mb-4 text-lg font-bold text-azul">
                Agregar servicios
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="servicio"
                    className="mb-1 block font-semibold"
                  >
                    Servicio
                  </label>

                  <select
                    id="servicio"
                    value={idServicio}
                    onChange={(evento) =>
                      seleccionarServicio(
                        Number(evento.target.value),
                      )
                    }
                    className={claseCampo}
                  >
                    <option value={0}>
                      Selecciona un servicio
                    </option>

                    {servicios.map((servicio) => (
                      <option
                        key={servicio.idServicio}
                        value={servicio.idServicio}
                      >
                        {servicio.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="precio"
                    className="mb-1 block font-semibold"
                  >
                    Precio aplicado (Q)
                  </label>

                  <input
                    id="precio"
                    type="number"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    value={precioAplicado}
                    onChange={(evento) =>
                      setPrecioAplicado(evento.target.value)
                    }
                    className={claseCampo}
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="observaciones"
                    className="mb-1 block font-semibold"
                  >
                    Observaciones
                  </label>

                  <textarea
                    id="observaciones"
                    rows={2}
                    maxLength={200}
                    value={observaciones}
                    onChange={(evento) =>
                      setObservaciones(evento.target.value)
                    }
                    className={claseCampo}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={agregarServicio}
                className={`mt-4 ${claseBotonAzul}`}
              >
                Agregar servicio
              </button>
            </div>

            {form.detalles.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-crema">
                    <tr>
                      <th className="px-3 py-3">Servicio</th>
                      <th className="px-3 py-3">
                        Observaciones
                      </th>
                      <th className="px-3 py-3">Activo</th>
                      <th className="px-3 py-3 text-right">
                        Precio
                      </th>
                      <th className="px-3 py-3">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {form.detalles.map((detalle, indice) => (
                      <tr
                        key={
                          detalle.idDetalleOrden !== undefined
                            ? `detalle-${detalle.idDetalleOrden}`
                            : `nuevo-${indice}`
                        }
                        className="border-b border-cafe/10"
                      >
                        <td className="px-3 py-3">
                          {obtenerServicio(detalle.idServicio)}
                        </td>

                        <td className="whitespace-pre-wrap break-words px-3 py-3">
                          {detalle.observaciones ||
                            "Sin observaciones"}
                        </td>

                        <td className="px-3 py-3">
                          {detalle.estado ? "Sí" : "No"}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          {formatoMoneda(
                            detalle.precioAplicado,
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              quitarServicio(indice)
                            }
                            className={claseBotonCoral}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cafe/15 pt-4">
              <p className="text-xl font-bold text-azul">
                Total: {formatoMoneda(totalCentavos / 100)}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    limpiarFormulario();
                    setError("");
                    setMensaje("");
                  }}
                  className={claseBotonSecundario}
                >
                  {idEdicion !== null
                    ? "Cancelar edición"
                    : "Limpiar formulario"}
                </button>

                <button
                  type="submit"
                  className={claseBotonAzul}
                >
                  {guardando
                    ? "Guardando..."
                    : idEdicion !== null
                      ? "Actualizar orden"
                      : "Guardar orden"}
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </section>

      <section className="rounded-xl border border-cafe/10 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-azul">
            Órdenes registradas
          </h2>

          <div className="w-full sm:w-80">
            <label
              htmlFor="buscarOrden"
              className="mb-1 block text-sm font-semibold"
            >
              Buscar orden
            </label>

            <input
              id="buscarOrden"
              type="search"
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Número, placa, responsable o estado"
              className={claseCampo}
            />
          </div>
        </div>

        {ordenes.length === 0 ? (
          <p className="rounded-lg bg-crema p-5 text-center">
            No hay órdenes activas registradas.
          </p>
        ) : ordenesFiltradas.length === 0 ? (
          <p className="rounded-lg bg-crema p-5 text-center">
            No se encontraron órdenes con esa búsqueda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-azul text-white">
                <tr>
                  <th className="px-4 py-3">Orden</th>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Ingreso</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">
                    Total
                  </th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ordenesFiltradas.map((orden) => (
                  <tr
                    key={orden.idOrden}
                    className="border-b border-cafe/10 even:bg-crema/50"
                  >
                    <td className="px-4 py-3 font-semibold">
                      #{orden.idOrden}
                    </td>

                    <td className="px-4 py-3">
                      {obtenerVehiculo(orden.idVehiculo)}
                    </td>

                    <td className="px-4 py-3">
                      {obtenerUsuario(orden.idUsuario)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatoFecha(orden.fechaIngreso)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatoFecha(orden.fechaEntrega)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-block whitespace-nowrap rounded-full bg-azul/10 px-3 py-1 text-xs font-semibold text-azul">
                        {orden.estadoOrden.replaceAll(
                          "_",
                          " ",
                        )}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                      {formatoMoneda(orden.total)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setOrdenDetalle(orden)
                          }
                          disabled={ocupado}
                          className={claseBotonSecundario}
                        >
                          Ver detalle
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            modificarOrden(orden)
                          }
                          disabled={ocupado}
                          className={claseBotonAzul}
                        >
                          Modificar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            confirmarAnulacion(orden)
                          }
                          disabled={ocupado}
                          className={claseBotonCoral}
                        >
                          {idAnulando === orden.idOrden
                            ? "Anulando..."
                            : "Anular"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {ordenDetalle && (
        <section
          aria-label={`Detalle de la orden ${ordenDetalle.idOrden}`}
          className="rounded-xl border border-azul/25 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-azul">
              Detalle de orden #{ordenDetalle.idOrden}
            </h2>

            <button
              type="button"
              onClick={() => setOrdenDetalle(null)}
              className={claseBotonSecundario}
            >
              Cerrar detalle
            </button>
          </div>

          <dl className="mb-5 grid gap-4 rounded-lg bg-crema/60 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-cafe/70">
                Vehículo
              </dt>
              <dd className="font-semibold">
                {obtenerVehiculo(ordenDetalle.idVehiculo)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-cafe/70">
                Responsable
              </dt>
              <dd className="font-semibold">
                {obtenerUsuario(ordenDetalle.idUsuario)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-cafe/70">
                Fecha de ingreso
              </dt>
              <dd>
                {formatoFecha(ordenDetalle.fechaIngreso)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-cafe/70">
                Fecha de entrega
              </dt>
              <dd>
                {formatoFecha(ordenDetalle.fechaEntrega)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-cafe/70">
                Estado del trabajo
              </dt>
              <dd className="font-semibold text-azul">
                {ordenDetalle.estadoOrden.replaceAll(
                  "_",
                  " ",
                )}
              </dd>
            </div>
          </dl>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-azul text-white">
                <tr>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">
                    Observaciones
                  </th>
                  <th className="px-4 py-3">Activo</th>
                  <th className="px-4 py-3 text-right">
                    Precio
                  </th>
                </tr>
              </thead>

              <tbody>
                {ordenDetalle.detalles.map((detalle) => (
                  <tr
                    key={detalle.idDetalleOrden}
                    className="border-b border-cafe/10 even:bg-crema/50"
                  >
                    <td className="px-4 py-3">
                      {obtenerServicio(detalle.idServicio)}
                    </td>

                    <td className="whitespace-pre-wrap break-words px-4 py-3">
                      {detalle.observaciones ||
                        "Sin observaciones"}
                    </td>

                    <td className="px-4 py-3">
                      {detalle.estado ? "Sí" : "No"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {formatoMoneda(
                        detalle.precioAplicado,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-right text-xl font-bold text-azul">
            Total: {formatoMoneda(ordenDetalle.total)}
          </p>
        </section>
      )}
    </div>
  );
}

export default Ordenes;