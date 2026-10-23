package com.proyecto.taller.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ServicioDTO {
    private Integer idServicio;
    @NotBlank @Size(max = 100)
    private String nombre;
    @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2)
    private BigDecimal precioBase;
    private Boolean estado;
}
