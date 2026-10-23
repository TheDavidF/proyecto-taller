package com.proyecto.taller.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UsuarioDTO {
    private Integer idUsuario;
    @NotNull @Positive
    private Integer idPerfil;
    @NotBlank @Size(max = 100)
    private String nombre;
    @NotBlank @Size(max = 50)
    private String usuario;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) @Size(min = 8, max = 100)
    private String contrasena;
    @NotBlank @Email @Size(max = 100)
    private String correo;
    private Boolean estado;
}
