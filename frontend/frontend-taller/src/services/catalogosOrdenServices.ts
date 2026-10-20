import api from "../api/axios";

import type {
  VehiculoOrden,
  UsuarioOrden,
  ServicioOrden,
} from "../types/catalogosOrden";

export const listarVehiculosOrden = () =>
  api.get<VehiculoOrden[]>("/api/vehiculos");

export const listarUsuariosOrden = () =>
  api.get<UsuarioOrden[]>("/api/usuarios");

export const listarServiciosOrden = () =>
  api.get<ServicioOrden[]>("/api/servicios");