package com.proyecto.taller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Integer idUsuario;
    private Integer idPerfil;
    private String nombre;
    private String usuario;
    private String contrasena;
    private String correo;
    private Boolean estado;
}