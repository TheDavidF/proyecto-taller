export interface Usuario {
  idUsuario: number;
  idPerfil: number;
  nombre: string;
  usuario: string;
  correo: string;
  estado: boolean;
}
export interface UsuarioFormulario {
  idPerfil: number;
  nombre: string;
  usuario: string;
  correo: string;
  contrasena?: string;
}
