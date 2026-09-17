package com.proyecto.taller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoDTO {
    private Integer idVehiculo;
    private String placa;
    private String marca;
    private String modelo;
    private String propietario;
    private String telefonoPropietario;
    private Boolean estado;
}