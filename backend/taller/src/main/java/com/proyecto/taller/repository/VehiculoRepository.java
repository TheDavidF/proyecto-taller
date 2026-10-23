package com.proyecto.taller.repository;

import com.proyecto.taller.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Integer> {
    List<Vehiculo> findByEstadoTrue();
    java.util.Optional<Vehiculo> findByPlaca(String placa);
    boolean existsByPlacaAndIdVehiculoNot(String placa, Integer id);
}
