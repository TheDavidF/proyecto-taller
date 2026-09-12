package com.proyecto.taller.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleOrdenDto {

    private Integer idDetalleOrden;
    private Integer idOrden;
    private Integer idServicio;
    private BigDecimal precioAplicado;
    private String observaciones;
    private Boolean estado = true;
}
