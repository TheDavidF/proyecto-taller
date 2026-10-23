import api from "../api/axios";
export interface Sesion {
  idUsuario: number;
  nombre: string;
  usuario: string;
  perfil: string;
  rol: "ADMIN" | "EMPLEADO";
}
export const consultarSesion = () => api.get<Sesion>("/api/auth/me");
export async function iniciarSesion(usuario: string, contrasena: string) {
  await api.post("/api/auth/login", new URLSearchParams({ usuario, contrasena }));
  return consultarSesion();
}
export const cerrarSesion = () => api.post("/api/auth/logout");
