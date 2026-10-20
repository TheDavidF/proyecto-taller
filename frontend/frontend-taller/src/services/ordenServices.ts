import api from "../api/axios";
import type { Orden, OrdenFormulario } from "../types/orden";

export const listarOrdenes = (incluirInactivos = false) =>
  api.get<Orden[]>("/api/ordenes", {
    params: { incluirInactivos },
  });

export const obtenerOrden = (id: number) =>
  api.get<Orden>(`/api/ordenes/${id}`);

export const crearOrden = (datos: OrdenFormulario) =>
  api.post<Orden>("/api/ordenes", datos);

export const actualizarOrden = (
  id: number,
  datos: OrdenFormulario,
) => api.put<Orden>(`/api/ordenes/${id}`, datos);

export const anularOrden = (id: number) =>
  api.put<void>(`/api/ordenes/${id}/anular`);

export const activarOrden = (id: number) =>
  api.put<Orden>(`/api/ordenes/${id}/activar`);