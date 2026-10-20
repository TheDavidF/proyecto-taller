package com.proyecto.taller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OrdenDto {
    private Integer idOrden;
    @NotNull @Positive
    private Integer idVehiculo;
    @NotNull @Positive
    private Integer idUsuario;
    @NotNull
    private LocalDate fechaIngreso;
    private LocalDate fechaEntrega;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private BigDecimal total;
    @NotBlank @Pattern(regexp = "PENDIENTE|EN_PROCESO|FINALIZADA|ENTREGADA", message = "debe ser PENDIENTE, EN_PROCESO, FINALIZADA o ENTREGADA")
    private String estadoOrden;
    private Boolean estado;
    @NotEmpty
    private List<@NotNull @Valid DetalleOrdenDto> detalles;
}
