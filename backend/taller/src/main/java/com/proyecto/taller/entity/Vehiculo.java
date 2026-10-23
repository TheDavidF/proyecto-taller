package com.proyecto.taller.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vehiculos")
@Getter
@Setter
@NoArgsConstructor
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vehiculo")
    private Integer idVehiculo;

    @Column(name = "placa", nullable = false, length = 15)
    private String placa;

    @Column(name = "marca", nullable = false, length = 40)
    private String marca;

    @Column(name = "modelo", nullable = false, length = 40)
    private String modelo;

    @Column(name = "propietario", nullable = false, length = 100)
    private String propietario;

    @Column(name = "telefono_propietario", nullable = false, length = 20)
    private String telefonoPropietario;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;
}