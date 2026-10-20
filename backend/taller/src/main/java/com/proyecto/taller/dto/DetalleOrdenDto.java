package com.proyecto.taller.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DetalleOrdenDto {
    private Integer idDetalleOrden;
    private Integer idOrden;
    @NotNull @Positive
    private Integer idServicio;
    @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2)
    private BigDecimal precioAplicado;
    @Size(max = 200)
    private String observaciones;
    private Boolean estado;
}
