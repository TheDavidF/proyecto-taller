package com.proyecto.taller.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ordenes_servicio")
@Getter
@Setter
@NoArgsConstructor

public class OrdenServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Integer idOrden;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Column(
        name = "total",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "estado_orden", nullable = false, length = 30)
    private String estadoOrden;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;
}