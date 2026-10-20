package com.proyecto.taller.repository;

import com.proyecto.taller.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    List<Usuario> findByEstadoTrue();
    java.util.Optional<Usuario> findByUsuario(String usuario);
    boolean existsByUsuarioAndIdUsuarioNot(String usuario, Integer id);
}
