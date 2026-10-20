package com.proyecto.taller.repository;

import com.proyecto.taller.entity.OrdenServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, Integer> {
    List<OrdenServicio> findByEstadoTrue();
}
