export interface VehiculoOrden {
  idVehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  propietario: string;
  estado: boolean;
}

export interface UsuarioOrden {
  idUsuario: number;
  idPerfil: number;
  nombre: string;
  usuario: string;
  estado: boolean;
}

export interface ServicioOrden {
  idServicio: number;
  nombre: string;
  precioBase: number;
  estado: boolean;
}