package com.proyecto.taller.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.taller.entity.DetalleOrden;

public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Integer> {

    List<DetalleOrden> findByOrdenServicioIdOrden(Integer idOrden);

    Optional<DetalleOrden> findByIdDetalleOrdenAndOrdenServicioIdOrden(Integer idDetalleOrden, Integer idOrden);
}
