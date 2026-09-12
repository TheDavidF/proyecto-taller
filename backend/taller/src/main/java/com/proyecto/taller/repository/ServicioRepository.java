package com.proyecto.taller.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.taller.entity.Servicio;

public interface ServicioRepository extends JpaRepository<Servicio, Integer> {
}
