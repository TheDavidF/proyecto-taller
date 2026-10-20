package com.proyecto.taller.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PerfilDTO {
    private Integer idPerfil;
    @NotBlank @Size(max = 80)
    private String nombre;
    private Boolean estado;
}
