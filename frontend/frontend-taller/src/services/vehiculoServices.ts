import api from "../api/axios";
import type { Vehiculo, VehiculoFormulario } from "../types/vehiculo";
export const listarVehiculos = (incluirInactivos = false) =>
  api.get<Vehiculo[]>("/api/vehiculos", { params: { incluirInactivos } });
export const obtenerVehiculo = (id: number) =>
  api.get<Vehiculo>(`/api/vehiculos/${id}`);
export const crearVehiculo = (datos: VehiculoFormulario) =>
  api.post<Vehiculo>("/api/vehiculos", datos);
export const actualizarVehiculo = (id: number, datos: VehiculoFormulario) =>
  api.put<Vehiculo>(`/api/vehiculos/${id}`, datos);
export const anularVehiculo = (id: number) =>
  api.put<void>(`/api/vehiculos/${id}/anular`);
export const activarVehiculo = (id: number) =>
  api.put<Vehiculo>(`/api/vehiculos/${id}/activar`);
