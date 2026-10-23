import api from "../api/axios";
import type { Usuario, UsuarioFormulario } from "../types/usuario";
export const listarUsuarios = (incluirInactivos = false) =>
  api.get<Usuario[]>("/api/usuarios", { params: { incluirInactivos } });
export const obtenerUsuario = (id: number) =>
  api.get<Usuario>(`/api/usuarios/${id}`);
export const crearUsuario = (datos: UsuarioFormulario) =>
  api.post<Usuario>("/api/usuarios", datos);
export const actualizarUsuario = (id: number, datos: UsuarioFormulario) =>
  api.put<Usuario>(`/api/usuarios/${id}`, datos);
export const anularUsuario = (id: number) =>
  api.put<void>(`/api/usuarios/${id}/anular`);
export const activarUsuario = (id: number) =>
  api.put<Usuario>(`/api/usuarios/${id}/activar`);
