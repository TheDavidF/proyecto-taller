export interface Vehiculo {
  idVehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  propietario: string;
  telefonoPropietario: string;
  estado: boolean;
}
export type VehiculoFormulario = Omit<Vehiculo, "idVehiculo" | "estado">;
