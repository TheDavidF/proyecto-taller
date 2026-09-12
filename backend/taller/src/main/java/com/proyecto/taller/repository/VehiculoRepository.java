package com.proyecto.taller.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.taller.entity.Vehiculo;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Integer> {
}
