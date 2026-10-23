import api from "../api/axios";
import type { Servicio, ServicioFormulario } from "../types/servicio";
export const listarServicios = (incluirInactivos = false) =>
  api.get<Servicio[]>("/api/servicios", { params: { incluirInactivos } });
export const obtenerServicio = (id: number) =>
  api.get<Servicio>(`/api/servicios/${id}`);
export const crearServicio = (datos: ServicioFormulario) =>
  api.post<Servicio>("/api/servicios", datos);
export const actualizarServicio = (id: number, datos: ServicioFormulario) =>
  api.put<Servicio>(`/api/servicios/${id}`, datos);
export const anularServicio = (id: number) =>
  api.put<void>(`/api/servicios/${id}/anular`);
export const activarServicio = (id: number) =>
  api.put<Servicio>(`/api/servicios/${id}/activar`);
