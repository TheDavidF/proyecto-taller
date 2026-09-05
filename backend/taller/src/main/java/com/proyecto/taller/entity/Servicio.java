package com.proyecto.taller.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "servicios")
@Getter
@Setter
@NoArgsConstructor
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Integer idServicio;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(
        name = "precio_base",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal precioBase;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;
}