package com.proyecto.taller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenDto {

    private Integer idOrden;
    private Integer idVehiculo;
    private Integer idUsuario;
    private LocalDate fechaIngreso;
    private LocalDate fechaEntrega;
    private BigDecimal total = BigDecimal.ZERO;
    private String estadoOrden;
    private Boolean estado = true;
    private List<DetalleOrdenDto> detalles = new ArrayList<>();
}
