import api from "../api/axios";
import type { Perfil, PerfilFormulario } from "../types/perfil";
export const listarPerfiles = (incluirInactivos = false) =>
  api.get<Perfil[]>("/api/perfiles", { params: { incluirInactivos } });
export const obtenerPerfil = (id: number) =>
  api.get<Perfil>(`/api/perfiles/${id}`);
export const crearPerfil = (datos: PerfilFormulario) =>
  api.post<Perfil>("/api/perfiles", datos);
export const actualizarPerfil = (id: number, datos: PerfilFormulario) =>
  api.put<Perfil>(`/api/perfiles/${id}`, datos);
export const anularPerfil = (id: number) =>
  api.put<void>(`/api/perfiles/${id}/anular`);
export const activarPerfil = (id: number) =>
  api.put<Perfil>(`/api/perfiles/${id}/activar`);
