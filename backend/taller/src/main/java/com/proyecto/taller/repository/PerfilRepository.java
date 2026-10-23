package com.proyecto.taller.repository;

import com.proyecto.taller.entity.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerfilRepository extends JpaRepository<Perfil, Integer> {
    List<Perfil> findByEstadoTrue();
}
