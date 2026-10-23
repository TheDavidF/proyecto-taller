export type EstadoOrden =
  "PENDIENTE" | "EN_PROCESO" | "FINALIZADA" | "ENTREGADA";
export interface DetalleOrdenFormulario {
  idDetalleOrden?: number;
  idServicio: number;
  precioAplicado: number;
  observaciones: string;
  estado: boolean;
}
export interface OrdenFormulario {
  idVehiculo: number;
  idUsuario: number;
  fechaIngreso: string;
  fechaEntrega: string | null;
  estadoOrden: EstadoOrden;
  detalles: DetalleOrdenFormulario[];
}
export interface DetalleOrden extends DetalleOrdenFormulario {
  idDetalleOrden: number;
  idOrden: number;
}
export interface Orden extends OrdenFormulario {
  idOrden: number;
  total: number;
  estado: boolean;
  detalles: DetalleOrden[];
}
