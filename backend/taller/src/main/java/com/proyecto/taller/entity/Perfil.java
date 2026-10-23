package com.proyecto.taller.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "perfiles")
@Getter
@Setter
@NoArgsConstructor
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil")
    private Integer idPerfil;

    @Column(name = "nombre", nullable = false, length = 80)
    private String nombre;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;
}