package com.proyecto.taller.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VehiculoDTO {
    private Integer idVehiculo;
    @NotBlank @Size(max = 15)
    private String placa;
    @NotBlank @Size(max = 40)
    private String marca;
    @NotBlank @Size(max = 40)
    private String modelo;
    @NotBlank @Size(max = 100)
    private String propietario;
    @NotBlank @Size(max = 20)
    private String telefonoPropietario;
    private Boolean estado;
}
